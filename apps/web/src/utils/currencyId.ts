import { Currency, UnifiedCurrency } from '@pancakeswap/sdk'

export function currencyId(currency?: UnifiedCurrency): string {
  if (currency?.isNative) return currency.symbol?.toUpperCase()
  if (currency?.isToken) return currency.address
  throw new Error('invalid currency')
}

export default currencyId
