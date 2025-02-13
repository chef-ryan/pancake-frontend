import { useMemo } from 'react'
import { TradeType } from '@pancakeswap/swap-sdk-core'
import { Currency, CurrencyAmount, Trade, bestTradeExactOut, isTradeBetter } from '@pancakeswap/ton-v2-sdk'
import { useUserSingleHopOnly } from '@pancakeswap/utils/user'
import { MAX_HOPS, BETTER_TRADE_LESS_HOPS_THRESHOLD } from 'config/constants/exchange'

import { useAllCommonPairs } from './useAllCommonPairs'

/**
 * Returns the best trade for the token in to the exact amount of token out
 */
export function useTradeExactOut(
  currencyAmountOut?: CurrencyAmount<Currency>,
  currencyIn?: Currency,
): { isLoading: boolean; data: Trade<Currency, Currency, TradeType> | null; refresh: () => void } {
  const { data: allowedPairs, isLoading, refresh } = useAllCommonPairs(currencyIn, currencyAmountOut?.currency)

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
    if (currencyIn && currencyAmountOut && allowedPairs.length > 0) {
      if (singleHopOnly) {
        return {
          ...res,
          isLoading: false,
          data:
            bestTradeExactOut(allowedPairs, currencyIn, currencyAmountOut, { maxHops: 1, maxNumResults: 1 })[0] ?? null,
        }
      }
      // search through trades with varying hops, find best trade out of them
      let bestTradeSoFar: Trade<Currency, Currency, TradeType> | null = null
      for (let i = 1; i <= MAX_HOPS; i++) {
        const currentTrade =
          bestTradeExactOut(allowedPairs, currencyIn, currencyAmountOut, { maxHops: i, maxNumResults: 1 })[0] ?? null
        if (isTradeBetter(bestTradeSoFar, currentTrade, BETTER_TRADE_LESS_HOPS_THRESHOLD)) {
          bestTradeSoFar = currentTrade
        }
      }
      return {
        ...res,
        isLoading: false,
        data: bestTradeSoFar,
      }
    }
    return {
      ...res,
      isLoading: false,
      data: null,
    }
  }, [currencyIn, currencyAmountOut, allowedPairs, singleHopOnly, isLoading, refresh])
}
