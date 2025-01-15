import { Currency } from '@pancakeswap/routing-sdk-addon-ton'

export function currencyKey(currency: Currency): string {
  return currency?.isToken ? currency.address : currency?.isNative ? currency.symbol : ''
}
