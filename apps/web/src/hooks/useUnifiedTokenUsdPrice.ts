import { useMemo } from 'react'
import { ChainId, NonEVMChainId } from '@pancakeswap/chains'
import { Currency } from '@pancakeswap/sdk'

import { useCurrencyUsdPrice } from './useCurrencyUsdPrice'
import { useSolanaTokenPrice } from './solana/useSolanaTokenPrice'

export function useUnifiedTokenUsdPrice(
  currency: Currency | { address: string; chainId: number },
  enabled: boolean = true,
) {
  const isSolana = 'chainId' in currency && currency.chainId === NonEVMChainId.SOLANA
  const isEvm = currency.chainId in ChainId

  const evmPrice = useCurrencyUsdPrice(isEvm ? (currency as Currency) : undefined, { enabled })
  const solanaPriceResult = useSolanaTokenPrice({
    mintList: isSolana && 'address' in currency ? [currency.address] : [],
    enabled,
  })

  return useMemo(() => {
    if (isEvm) {
      return evmPrice
    }
    if (isSolana && 'address' in currency) {
      return {
        data: solanaPriceResult.data?.[`${NonEVMChainId.SOLANA}-${currency.address}`] ?? 0,
        isLoading: solanaPriceResult.isLoading,
        error: solanaPriceResult.error,
      }
    }
    return { data: 0, isLoading: false, error: undefined }
  }, [
    currency,
    evmPrice,
    isEvm,
    isSolana,
    solanaPriceResult.data,
    solanaPriceResult.error,
    solanaPriceResult.isLoading,
  ])
}
