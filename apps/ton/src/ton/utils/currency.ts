import { Currency } from '@pancakeswap/routing-sdk-addon-ton'

export function currencyKey(currency: Currency): string {
  return currency ? currency!.address || currency.symbol : ''
}
