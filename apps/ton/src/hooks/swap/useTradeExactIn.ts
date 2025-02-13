import { useMemo } from 'react'
import { TradeType } from '@pancakeswap/swap-sdk-core'
import { Currency, CurrencyAmount, Trade, bestTradeExactIn, isTradeBetter } from '@pancakeswap/ton-v2-sdk'
import { useUserSingleHopOnly } from '@pancakeswap/utils/user'
import { BETTER_TRADE_LESS_HOPS_THRESHOLD, MAX_HOPS } from 'config/constants/exchange'

import { useAllCommonPairs } from './useAllCommonPairs'

/**
 * Returns the best trade for the exact amount of tokens in to the given token out
 */
export function useTradeExactIn(
  currencyAmountIn?: CurrencyAmount<Currency>,
  currencyOut?: Currency,
): { isLoading: boolean; data: Trade<Currency, Currency, TradeType> | null; refresh: () => void } {
  const { data: allowedPairs, isLoading, refresh } = useAllCommonPairs(currencyAmountIn?.currency, currencyOut)

  const [singleHopOnly] = useUserSingleHopOnly()

  return useMemo(() => {
    const res = {
      isLoading,
      refresh,
      data: null,
    }
    if (isLoading) {
      return res
    }
    if (currencyAmountIn && currencyOut && allowedPairs.length > 0) {
      if (singleHopOnly) {
        return {
          ...res,
          isLoading: false,
          data:
            bestTradeExactIn(allowedPairs, currencyAmountIn, currencyOut, { maxHops: 1, maxNumResults: 1 })[0] ?? null,
        }
      }
      // search through trades with varying hops, find best trade out of them
      let bestTradeSoFar: Trade<Currency, Currency, TradeType> | null = null
      for (let i = 1; i <= MAX_HOPS; i++) {
        const currentTrade: Trade<Currency, Currency, TradeType> | null =
          bestTradeExactIn(allowedPairs, currencyAmountIn, currencyOut, { maxHops: i, maxNumResults: 1 })[0] ?? null
        // if current trade is best yet, save it
        if (isTradeBetter(bestTradeSoFar, currentTrade, BETTER_TRADE_LESS_HOPS_THRESHOLD)) {
          bestTradeSoFar = currentTrade
        }
      }
      return { ...res, isLoading: false, data: bestTradeSoFar }
    }

    return {
      ...res,
      isLoading: false,
      data: null,
    }
  }, [refresh, allowedPairs, currencyAmountIn, currencyOut, singleHopOnly, isLoading])
}
