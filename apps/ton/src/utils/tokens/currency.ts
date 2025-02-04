import { Currency } from '@pancakeswap/ton-v2-sdk'

export function currencyKey(currency?: Currency): string {
  if (!currency) return 'UNKNOWN'
  return currency.isNative ? currency.symbol : currency.address
}
