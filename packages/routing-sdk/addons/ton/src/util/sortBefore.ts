import { CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { Currency } from '../currency'

export function sortBefore(a: Currency, b: Currency): boolean
export function sortBefore(a: CurrencyAmount<Currency>, b: CurrencyAmount<Currency>): boolean
export function sortBefore(a: CurrencyAmount<Currency> | Currency, b: CurrencyAmount<Currency> | Currency) {
  const currencyA = a instanceof CurrencyAmount ? a.currency : a
  const currencyB = b instanceof CurrencyAmount ? b.currency : b

  return currencyA.wrapped.address < currencyB.wrapped.address
}
