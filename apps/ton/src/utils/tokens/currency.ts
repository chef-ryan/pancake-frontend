import { Currency } from '@pancakeswap/routing-sdk-addon-ton'

export function currencyKey(currency?: Currency): string {
  if (!currency) return 'UNKNOWN'
  return currency.isNative ? currency.symbol : currency.address
}
