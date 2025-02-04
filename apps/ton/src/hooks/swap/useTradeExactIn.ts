import { Currency, CurrencyAmount, Trade } from '@pancakeswap/ton-v2-sdk'

// todo:@eric implement
export const useTradeExactIn = (amount?: CurrencyAmount<Currency>, currency?: Currency) => {
  if (!amount || !currency) return undefined
  const allPairs = []
  return Trade.bestTradeExactIn(allPairs, currency, amount)
}
