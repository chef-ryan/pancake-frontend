import { Currency, getCurrencyAddress, NativeCurrency, Token } from '@pancakeswap/swap-sdk-core'

function isCurrency(a: any): a is Currency {
  return a instanceof NativeCurrency || a instanceof Token
}

export function isEqual(a: any, b: any): boolean {
  if (a === b) return true

  if (a == null || typeof a !== 'object' || b == null || typeof b !== 'object') {
    return false
  }

  if (Array.isArray(a) !== Array.isArray(b)) return false

  if (isCurrency(a) && isCurrency(b)) {
    return getCurrencyAddress(a) === getCurrencyAddress(b)
  }

  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) return false

  for (const key of keysA) {
    if (!keysB.includes(key) || !isEqual(a[key], b[key])) {
      return false
    }
  }

  return true
}
