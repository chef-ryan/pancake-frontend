export function currencyKey(currency: any): string {
  return currency ? currency.address || currency.symbol : ''
}
