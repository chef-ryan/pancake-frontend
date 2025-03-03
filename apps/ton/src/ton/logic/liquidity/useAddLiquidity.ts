import { Currency, storeAddLiquidity } from '@pancakeswap/ton-v2-sdk'
import { storeJettonTransferMessage } from '@ton-community/assets-sdk'
import { beginCell, toNano } from '@ton/core'
import { SendTransactionRequest, useTonConnectUI } from '@tonconnect/ui-react'
import { resetAppModalAtom } from 'atoms/modals/appModalAtom'
import { setTransactionModalAtom } from 'atoms/modals/transactionModalAtom'
import { ActionType } from 'components/Modals/ActionModal'
import { useUserAddress } from 'hooks/useUserAddress'
import { useAtomValue, useSetAtom } from 'jotai'
import { useRouter } from 'next/router'
import { useCallback } from 'react'
import { routerContractAtom } from 'ton/atom/contracts/routerContractAtom'

import { formatBalance } from 'ton/utils/formatting'
import { generateQueryId } from 'ton/utils/generateQueryId'
import { getJettonWalletAddress } from 'ton/utils/jettonWalletAddress'
import { getCurrencyOrder } from 'ton/utils/tokenOrder'
import { getTransactionByBOC } from 'ton/utils/transaction'
import { logGTMAddLiquidityTxSentEvent } from 'utils/customGTMEventTracking'

import BN from 'bignumber.js'

interface AddLiquidityArgs {
  token0: Currency
  token1: Currency

  amount0: bigint
  amount1: bigint

  minLpOut: bigint
}

const GAS = BN(toNano('0.6').toString())
const FORWARD_GAS = toNano('0.3')

export const useAddLiquidity = () => {
  const router = useRouter()
  const [tonUI] = useTonConnectUI()

  const userAddress = useUserAddress()
  const routerAddress = useAtomValue(routerContractAtom).address

  const setTxnModal = useSetAtom(setTransactionModalAtom)
  const resetAppModal = useSetAtom(resetAppModalAtom)

  const addLiquidity = useCallback(
    async ({ token0, token1, minLpOut, amount0: amount0_, amount1: amount1_ }: AddLiquidityArgs) => {
      try {
        const { currency0, currency1, isFlipped } = await getCurrencyOrder(token0, token1)
        let amount0 = amount0_
        let amount1 = amount1_
        if (isFlipped) {
          amount0 = amount1_
          amount1 = amount0_
        }

        const formattedAmount0 = formatBalance(amount0, currency0.decimals)
        const formattedAmount1 = formatBalance(amount1, currency1.decimals)
        setTxnModal({
          type: ActionType.ConfirmLiquiditySupply,
          currency0,
          currency1,
          amount0: formattedAmount0,
          amount1: formattedAmount1,
          isOpen: true,
        })

        const [userJettonWallet0, userJettonWallet1, routerJettonWallet0, routerJettonWallet1] = await Promise.all([
          getJettonWalletAddress(userAddress, currency0.wrapped.address),
          getJettonWalletAddress(userAddress, currency1.wrapped.address),
          getJettonWalletAddress(routerAddress, currency0.wrapped.address),
          getJettonWalletAddress(routerAddress, currency1.wrapped.address),
        ])

        if (!userJettonWallet0 || !userJettonWallet1 || !routerJettonWallet0 || !routerJettonWallet1) {
          throw new Error('Failed to get Jetton Wallet addresses')
        }

        const forwardPayload0 = beginCell()
          .store(
            storeAddLiquidity({
              minLPOut: minLpOut,
              tokenWallet: routerJettonWallet1,
            }),
          )
          .endCell()
        const payload0 = beginCell()
          .store(
            storeJettonTransferMessage({
              queryId: generateQueryId(),
              amount: amount0,
              destination: routerAddress,
              responseDestination: userAddress,
              customPayload: null,
              forwardAmount: FORWARD_GAS,
              forwardPayload: forwardPayload0,
            }),
          )
          .endCell()

        const forwardPayload1 = beginCell()
          .store(
            storeAddLiquidity({
              minLPOut: minLpOut,
              tokenWallet: routerJettonWallet0,
            }),
          )
          .endCell()
        const payload1 = beginCell()
          .store(
            storeJettonTransferMessage({
              queryId: generateQueryId(),
              amount: amount1,
              destination: routerAddress,
              responseDestination: userAddress,
              customPayload: null,
              forwardAmount: FORWARD_GAS,
              forwardPayload: forwardPayload1,
            }),
          )
          .endCell()

        const txRequest: SendTransactionRequest = {
          validUntil: Math.floor(Date.now() / 1000) + 60 * 2,
          messages: [
            {
              address: currency0.isNative ? routerJettonWallet0.toString() : userJettonWallet0.toString(),
              amount: GAS.plus(currency0.isNative ? amount0.toString() : BN(0)).toString(),
              payload: payload0.toBoc().toString('base64'),
            },
            {
              address: currency1.isNative ? routerJettonWallet1.toString() : userJettonWallet1.toString(),
              amount: GAS.plus(currency1.isNative ? amount1.toString() : BN(0)).toString(),
              payload: payload1.toBoc().toString('base64'),
            },
          ],
        }

        const { boc } = await tonUI.sendTransaction(txRequest, { modals: ['error'] })

        if (boc) {
          setTxnModal({
            type: ActionType.TransactionSubmitted,
            currency0,
            currency1,
            amount0: formattedAmount0,
            amount1: formattedAmount1,
          })
        }
        const hash = await getTransactionByBOC(userAddress, boc)
        if (hash) {
          logGTMAddLiquidityTxSentEvent()
          setTxnModal({
            type: ActionType.TransactionComplete,
            currency0,
            currency1,
            amount0: formattedAmount0,
            amount1: formattedAmount1,
            hash,
          })

          router.push('/liquidity')
        }
      } catch (e) {
        console.error(e)

        // Close the modal
        resetAppModal()
      }
    },
    [tonUI, userAddress, routerAddress, setTxnModal, resetAppModal, router],
  )

  return {
    addLiquidity,
  }
}
