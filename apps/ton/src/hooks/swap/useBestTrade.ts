import { useCallback } from 'react'
import { Currency, CurrencyAmount } from '@pancakeswap/ton-v2-sdk'
import { useTradeExactIn } from './useTradeExactIn'
import { useTradeExactOut } from './useTradeExactOut'

export const useBestTrade = ({
  isExactIn,
  amount,
  inputCurrency,
  outputCurrency,
}: {
  isExactIn: boolean
  amount: CurrencyAmount<Currency> | undefined
  inputCurrency: Currency | undefined
  outputCurrency: Currency | undefined
}) => {
  const {
    isLoading: isTradeExactInLoading,
    data: bestTradeExactIn,
    refresh: refreshTradeExactIn,
  } = useTradeExactIn(isExactIn ? amount : undefined, outputCurrency ?? undefined)

  const {
    isLoading: isTradeExactOutLoading,
    data: bestTradeExactOut,
    refresh: refreshTradeExactOut,
  } = useTradeExactOut(isExactIn ? undefined : amount, inputCurrency ?? undefined)

  const trade = isExactIn ? bestTradeExactIn : bestTradeExactOut

  const refreshTrade = useCallback(() => {
    refreshTradeExactIn()
    refreshTradeExactOut()
  }, [refreshTradeExactIn, refreshTradeExactOut])

  return {
    isTradeExactInLoading,
    isTradeExactOutLoading,
    trade,
    refreshTrade,
  }
}
