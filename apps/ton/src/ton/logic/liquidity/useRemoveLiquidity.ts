import { Currency } from '@pancakeswap/ton-v2-sdk'
import { beginCell, toNano } from '@ton/core'
import { SendTransactionRequest, useTonConnectUI } from '@tonconnect/ui-react'
import { resetAppModalAtom } from 'atoms/modals/appModalAtom'
import { setTransactionModalAtom } from 'atoms/modals/transactionModalAtom'
import BN from 'bignumber.js'
import { ActionType } from 'components/Modals/ActionModal'
import { useUserAddress } from 'hooks/useUserAddress'
import { useUserSlippage } from 'hooks/useUserSlippage'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { poolContractAtom } from 'ton/atom/contracts/poolContractAtom'
import { poolAddressAtom } from 'ton/atom/liquidity/poolAddressAtom'
import { parseUnits } from 'ton/utils/formatting'
import { getTransactionByBOC } from 'ton/utils/transaction'
import { storeTokenBurn } from 'ton/wrappers/tact_LpWallet'

interface RemoveLiquidityProps {
  currency0?: Currency
  currency1?: Currency

  amount0ToBurn: string
  amount1ToBurn: string
}

export const useRemoveLiquidity = ({ currency0, currency1, amount0ToBurn, amount1ToBurn }: RemoveLiquidityProps) => {
  const [tonUI] = useTonConnectUI()
  const userAddress = useUserAddress()

  const setTxnModal = useSetAtom(setTransactionModalAtom)
  const resetAppModal = useSetAtom(resetAppModalAtom)

  const [slippage] = useUserSlippage()

  const poolAddress = useAtomValue(
    poolAddressAtom({
      token0Address: currency0?.wrapped.address.toString(),
      token1Address: currency1?.wrapped.address.toString(),
    }),
  )

  const poolContract = useAtomValue(poolContractAtom(poolAddress?.toString()))

  const removeLiquidity = useCallback(
    async (amount: bigint) => {
      try {
        setTxnModal({
          type: ActionType.ConfirmLiquidityRemoval,
          currency0,
          currency1,
          amount0: amount0ToBurn,
          amount1: amount1ToBurn,
          isOpen: true,
        })

        const userLpWallet = await poolContract.getGetWalletAddress(userAddress)

        const token0MinOut = parseUnits(
          BN(amount0ToBurn)
            .multipliedBy(1 - slippage / 1e4)
            .toString(),
          currency0?.decimals,
        )

        const token1MinOut = parseUnits(
          BN(amount1ToBurn)
            .multipliedBy(1 - slippage / 1e4)
            .toString(),
          currency1?.decimals,
        )

        const payload = beginCell()
          .store(
            storeTokenBurn({
              queryId: 3n,
              $$type: 'TokenBurn',
              amount,
              responseDestination: userAddress,
              customPayload: beginCell().storeCoins(token0MinOut).storeCoins(token1MinOut).endCell(),
            }),
          )
          .endCell()

        const txRequest: SendTransactionRequest = {
          validUntil: Math.floor(Date.now() / 1000) + 60 * 2,
          messages: [
            {
              address: userLpWallet.toString(),
              amount: toNano('0.5').toString(),
              payload: payload.toBoc().toString('base64'),
            },
          ],
        }

        const { boc } = await tonUI.sendTransaction(txRequest)
        if (boc) {
          setTxnModal({
            type: ActionType.TransactionSubmitted,
            currency0,
            currency1,
            amount0: amount0ToBurn,
            amount1: amount1ToBurn,
          })
        }

        const hash = await getTransactionByBOC(userAddress, boc)
        if (hash) {
          setTxnModal({
            type: ActionType.TransactionComplete,
            currency0,
            currency1,
            amount0: amount0ToBurn,
            amount1: amount1ToBurn,
            hash,
          })
        }
      } catch (error) {
        console.error(error)
        resetAppModal()
      }
    },
    [
      slippage,
      tonUI,
      userAddress,
      poolContract,
      setTxnModal,
      currency0,
      currency1,
      amount0ToBurn,
      amount1ToBurn,
      resetAppModal,
    ],
  )

  return { removeLiquidity }
}
