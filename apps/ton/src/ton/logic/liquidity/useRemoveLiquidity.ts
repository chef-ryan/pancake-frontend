import { Currency } from '@pancakeswap/ton-v2-sdk'
import { beginCell, toNano } from '@ton/core'
import { SendTransactionRequest, useTonConnectUI } from '@tonconnect/ui-react'
import { useAtomValue } from 'jotai'
import { useCallback } from 'react'
import { addressAtom } from 'ton/atom/addressAtom'
import { poolContractAtom } from 'ton/atom/contracts/poolContractAtom'
import { poolAddressAtom } from 'ton/atom/liquidity/poolAddressAtom'
import { parseAddress } from 'ton/utils/address'
import { storeTokenBurn } from 'ton/wrappers/tact_LpWallet'

interface RemoveLiquidityProps {
  currency0?: Currency
  currency1?: Currency

  amount: bigint
}

export const useRemoveLiquidity = ({ currency0, currency1, amount }: RemoveLiquidityProps) => {
  const [tonUI] = useTonConnectUI()
  const userAddress_ = useAtomValue(addressAtom)

  // TODO: Handle Native
  const poolAddress = useAtomValue(
    poolAddressAtom({
      token0Address: currency0?.wrapped.address.toString(),
      token1Address: currency1?.wrapped.address.toString(),
    }),
  )

  const poolContract = useAtomValue(poolContractAtom(poolAddress?.toString()))

  const removeLiquidity = useCallback(async () => {
    const userAddress = parseAddress(userAddress_)

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
  }, [tonUI, userAddress_, poolContract, amount])

  return { removeLiquidity }
}
