import { ClassicOrder, OrderType } from '@pancakeswap/price-api-sdk'
import { TradeType } from '@pancakeswap/sdk'
import tryParseAmount from '@pancakeswap/utils/tryParseAmount'
import { useUserSingleHopOnly } from '@pancakeswap/utils/user'

import { useDebounce } from '@orbs-network/twap-ui/dist/hooks'
import { useCurrency } from 'hooks/Tokens'
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
import { useBestAMMTrade } from './useBestAMMTrade'
import { LoadedValue } from './utils/LoadedValue'

interface Options {
  maxHops?: number
}

export function useSwapBestTrade({ maxHops }: Options = {}) {
  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
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

  const {
    isLoading,
    trade,
    refresh: refreshQuote,
    syncing,
    isStale,
    error,
  } = useBestAMMTrade({
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
    type: 'auto',
    trackPerf: true,
  })
  const [loading, setLoading] = useState(false)
  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      const res = await refreshQuote()
      return res
    } finally {
      setLoading(false)
    }
  }, [refreshQuote])
  const debouncedAmount = useDebounce(amount, 300)

  const isAutoRefetch = useMemo(
    () =>
      !loading &&
      (isLoading || syncing) &&
      debouncedAmount &&
      inputCurrency &&
      outputCurrency &&
      trade &&
      debouncedAmount.toExact() === (isExactIn ? trade.inputAmount.toExact() : trade.outputAmount.toExact()) &&
      trade.inputAmount.currency.equals(inputCurrency) &&
      trade.outputAmount.currency.equals(outputCurrency),
    [loading, isLoading, syncing, amount, trade, isExactIn, inputCurrency, outputCurrency],
  )
  return {
    refresh,
    syncing,
    isStale,
    error,
    isLoading: useDeferredValue(
      Boolean(((isLoading || syncing) && !isAutoRefetch) || (typedValue && !trade && !error)),
    ),
    trade: typedValue ? trade : undefined,
    type: OrderType.PCS_CLASSIC,
  } as LoadedValue<ClassicOrder>
}
