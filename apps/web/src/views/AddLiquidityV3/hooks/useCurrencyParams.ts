import { ChainId, isEvm, isSolana } from '@pancakeswap/chains'
import { CAKE, STABLE_COIN, USDC, USDT } from '@pancakeswap/tokens'
import { FeeAmount } from '@pancakeswap/v3-sdk'
import { useClmmAmmConfigs } from 'hooks/solana/useClmmAmmConfigs'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useUnifiedNativeCurrency } from 'hooks/useNativeCurrency'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

// Get default currency pair based on chain
const getDefaultCurrencyPair = (
  chainId?: ChainId,
  native?: { symbol: string },
): [string | undefined, string | undefined] => {
  if (!chainId || !native) return [undefined, undefined]

  // BNB-USDT on BNB Chain
  if (chainId === ChainId.BSC) {
    return [
      native.symbol,
      USDT[chainId]?.address || CAKE[chainId]?.address || STABLE_COIN[chainId]?.address || USDC[chainId]?.address,
    ]
  }

  // ETH-USDC on all other EVM deployments
  return [
    native.symbol,
    USDC[chainId]?.address || USDT[chainId]?.address || CAKE[chainId]?.address || STABLE_COIN[chainId]?.address,
  ]
}

export function useCurrencyParams(): {
  currencyIdA: string | undefined
  currencyIdB: string | undefined
  feeAmount: FeeAmount | undefined
} {
  const { chainId } = useActiveChainId()
  const router = useRouter()
  const native = useUnifiedNativeCurrency()

  const [currencyIdA, currencyIdB] =
    router.isReady && chainId
      ? router.query.currency || getDefaultCurrencyPair(chainId, native)
      : [undefined, undefined]

  const feeAmount: FeeAmount | undefined = useFeeAmountFromQuery()

  return { currencyIdA, currencyIdB, feeAmount }
}

export const useFeeAmountFromQuery = () => {
  const { chainId } = useActiveChainId()
  const router = useRouter()
  const ammConfig = useClmmAmmConfigs()

  const feeAmountFromUrl = router.isReady && chainId ? (router.query.currency?.[2] as string) : undefined

  return useMemo(
    () =>
      feeAmountFromUrl &&
      ((isEvm(chainId) && Object.values(FeeAmount).includes(parseFloat(feeAmountFromUrl))) ||
        (isSolana(chainId) && Object.values(ammConfig).find((c) => c.tradeFeeRate === parseFloat(feeAmountFromUrl))))
        ? parseFloat(feeAmountFromUrl)
        : undefined,
    [chainId, ammConfig, feeAmountFromUrl],
  )
}
