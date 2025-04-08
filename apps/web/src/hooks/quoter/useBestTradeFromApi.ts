import { useDebounce, usePreviousValue } from '@pancakeswap/hooks'
import { getRequestBody, parseQuoteResponse } from '@pancakeswap/price-api-sdk'
import { PoolType } from '@pancakeswap/smart-router'
import { TradeType } from '@pancakeswap/swap-sdk-core'
import { useUserSlippage } from '@pancakeswap/utils/user'
import { useQuery } from '@tanstack/react-query'
import { QUOTING_API } from 'config/constants/endpoints'
import { POOLS_FAST_REVALIDATE } from 'config/pools'
import { useDeferredValue, useMemo } from 'react'
import { useFeeDataWithGasPrice } from 'state/user/hooks'
import { tracker } from 'utils/datadog'
import { basisPointsToPercent } from 'utils/exchange'
import { useAccount } from 'wagmi'
import { Options } from './quoter.types'

export function useBestTradeFromApi({
  // baseCurrency,
  amount,
  currency,
  enabled,
  maxHops,
  maxSplits,
  stableSwap,
  trackPerf,
  tradeType = TradeType.EXACT_INPUT,
  v2Swap,
  v3Swap,
  retry = false,
}: Options) {
  const [slippage] = useUserSlippage()
  const poolTypes = useMemo(() => {
    const types: PoolType[] = []
    if (v2Swap) {
      types.push(PoolType.V2)
    }
    if (v3Swap) {
      types.push(PoolType.V3)
    }
    if (stableSwap) {
      types.push(PoolType.STABLE)
    }
    if (types.length === 0) {
      return undefined
    }
    return types
  }, [v2Swap, v3Swap, stableSwap])

  // useTradeApiPrefetch({
  //   currencyA: baseCurrency,
  //   currencyB: currency,
  //   enabled,
  //   poolTypes,
  // })

  const deferQuotientRaw = useDeferredValue(amount?.quotient?.toString())
  const deferQuotient = useDebounce(deferQuotientRaw, 500)
  const { address } = useAccount()
  const { gasPrice } = useFeeDataWithGasPrice()

  const previousEnabled = usePreviousValue(enabled)

  return useQuery({
    enabled: !!(amount && currency && deferQuotient && enabled),
    refetchInterval: POOLS_FAST_REVALIDATE[currency?.chainId as keyof typeof POOLS_FAST_REVALIDATE] ?? 10_000,
    queryKey: [
      'quote-api',
      address,
      currency?.chainId,
      amount?.currency?.symbol,
      currency?.symbol,
      tradeType,
      deferQuotient,
      maxHops,
      maxSplits,
      poolTypes,
      slippage,
    ] as const,
    retry,
    queryFn: async ({ signal, queryKey }) => {
      const [key] = queryKey
      if (!amount || !amount.currency || !currency || !deferQuotient) {
        throw new Error('Invalid amount or currency')
      }

      const startTime = performance.now()

      const body = getRequestBody({
        amount,
        quoteCurrency: currency,
        tradeType,
        slippage: basisPointsToPercent(slippage),
        amm: { maxHops, maxSplits, poolTypes, gasPriceWei: gasPrice },
        x: {
          useSyntheticQuotes: true,
          swapper: address,
        },
      })

      const serverRes = await fetch(`${QUOTING_API}`, {
        method: 'POST',
        signal,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })
      const serializedRes = await serverRes.json()

      const isExactIn = tradeType === TradeType.EXACT_INPUT
      const result = parseQuoteResponse(serializedRes, {
        chainId: currency.chainId,
        currencyIn: isExactIn ? amount.currency : currency,
        currencyOut: isExactIn ? currency : amount.currency,
        tradeType,
      })

      const duration = Math.floor(performance.now() - startTime)

      if (trackPerf) {
        tracker.log(`[PERF] ${key} duration:${duration}ms`, {
          chainId: currency.chainId,
          label: key,
          duration,
        })
      }

      return result
    },
    placeholderData: (previousData, previousQuery) => {
      const queryKey = previousQuery?.queryKey

      if (!queryKey) return undefined
      if (!previousEnabled) return undefined

      return previousData
    },
  })
}
