import { CurrencyAmount } from '@pancakeswap/sdk'

export const useCurrencyBalance = (account: string, currency?: any) => {
  if (!currency) return undefined
  return CurrencyAmount.fromRawAmount(currency, 0)
}
