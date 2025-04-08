import { TradeType } from '@pancakeswap/sdk'
import tryParseAmount from '@pancakeswap/utils/tryParseAmount'
import { useUserSingleHopOnly } from '@pancakeswap/utils/user'

import { useCurrency } from 'hooks/Tokens'
import { usePCSXEnabledOnChain } from 'hooks/usePCSX'
import { useCallback, useDeferredValue, useMemo, useState } from 'react'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import {
  useUserInfinitySwapEnable,
  useUserSplitRouteEnable,
  useUserStableSwapEnable,
  useUserV2SwapEnable,
  useUserV3SwapEnable,
} from 'state/user/smartRouter'
import { Options as BestTradeFromApiOptions } from './quoter.types'
import { useBestTradeFromApi } from './useBestTradeFromApi'

interface Options {
  maxHops?: number
}

export function useSwapBestOrder({ maxHops }: Options = {}) {
  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const enabled = usePCSXEnabledOnChain(inputCurrency?.chainId)
  const isExactIn = independentField === Field.INPUT
  const independentCurrency = isExactIn ? inputCurrency : outputCurrency
  const dependentCurrency = isExactIn ? outputCurrency : inputCurrency
  const tradeType = isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT
  const amount = tryParseAmount(typedValue, independentCurrency ?? undefined)

  const [singleHopOnly] = useUserSingleHopOnly()
  const [split] = useUserSplitRouteEnable()
  const [v2Swap] = useUserV2SwapEnable()
  const [v3Swap] = useUserV3SwapEnable()
  const [infinitySwap] = useUserInfinitySwapEnable()
  const [stableSwap] = useUserStableSwapEnable()
  // stable swap only support exact in
  const stableSwapEnable = useMemo(() => {
    return stableSwap && isExactIn
  }, [stableSwap, isExactIn])

  const bestTradeOptions = {
    enabled,
    amount,
    currency: dependentCurrency,
    baseCurrency: independentCurrency,
    tradeType,
    maxHops: singleHopOnly ? 1 : maxHops,
    maxSplits: split ? undefined : 0,
    v2Swap,
    v3Swap,
    infinitySwap,
    stableSwap: stableSwapEnable,
    trackPerf: true,
    retry: 1,
  } satisfies BestTradeFromApiOptions
  const { fetchStatus, data, isStale, error, refetch } = useBestTradeFromApi(bestTradeOptions)
  // useBestTradeFromApiShadow(bestTradeOptions, 'quote-api-ori')
  // useBestTradeFromApiShadow(bestTradeOptions, 'quote-api-opt')

  const [loading, setLoading] = useState(false)
  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      const res = await refetch()
      return res
    } finally {
      setLoading(false)
    }
  }, [refetch])

  const isValidQuote = useMemo(
    () =>
      amount &&
      inputCurrency &&
      outputCurrency &&
      data?.trade &&
      amount.toExact() === (isExactIn ? data.trade.inputAmount.toExact() : data.trade.outputAmount.toExact()) &&
      data.trade.inputAmount.currency.equals(inputCurrency) &&
      data.trade.outputAmount.currency.equals(outputCurrency),
    [amount, data?.trade, isExactIn, inputCurrency, outputCurrency],
  )

  const isAutoRefetch = useMemo(
    () => !loading && fetchStatus === 'fetching' && isValidQuote,
    [loading, fetchStatus, isValidQuote],
  )

  return {
    enabled,
    refresh,
    isStale,
    isValidQuote,
    error,
    isLoading: useDeferredValue(
      Boolean((fetchStatus === 'fetching' && !isAutoRefetch) || (typedValue && !data && !error)),
    ),
    order: typedValue ? data : undefined,
  }
}
