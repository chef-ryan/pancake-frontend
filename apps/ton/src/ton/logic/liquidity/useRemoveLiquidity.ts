import { Currency } from '@pancakeswap/ton-v2-sdk'
import { beginCell, toNano } from '@ton/core'
import { SendTransactionRequest, useTonConnectUI } from '@tonconnect/ui-react'
import { useUserAddress } from 'hooks/useUserAddress'
import { useAtomValue } from 'jotai'
import { useCallback } from 'react'
import { poolContractAtom } from 'ton/atom/contracts/poolContractAtom'
import { poolAddressAtom } from 'ton/atom/liquidity/poolAddressAtom'
import { storeTokenBurn } from 'ton/wrappers/tact_LpWallet'

interface RemoveLiquidityProps {
  currency0?: Currency
  currency1?: Currency
}

export const useRemoveLiquidity = ({ currency0, currency1 }: RemoveLiquidityProps) => {
  const [tonUI] = useTonConnectUI()
  const userAddress = useUserAddress()

  // TODO: Check Native handling
  const poolAddress = useAtomValue(
    poolAddressAtom({
      token0Address: currency0?.isNative ? userAddress.toString() : currency0?.address.toString(),
      token1Address: currency1?.isNative ? userAddress.toString() : currency1?.address.toString(),
    }),
  )

  const poolContract = useAtomValue(poolContractAtom(poolAddress?.toString()))

  const removeLiquidity = useCallback(
    async (amount: bigint) => {
      const userLpWallet = await poolContract.getGetWalletAddress(userAddress)

      const payload = beginCell()
        .store(
          storeTokenBurn({
            queryId: 3n,
            $$type: 'TokenBurn',
            amount,
            responseDestination: userAddress,
            customPayload: null,
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

      tonUI.sendTransaction(txRequest)
    },
    [tonUI, userAddress, poolContract],
  )

  return { removeLiquidity }
}
