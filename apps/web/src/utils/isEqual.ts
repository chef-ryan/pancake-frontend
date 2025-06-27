import { Currency, getCurrencyAddress } from '@pancakeswap/swap-sdk-core'

function isCurrency(a: any): a is Currency {
  if (a == null || typeof a !== 'object') return false
  if (Object.prototype.hasOwnProperty.call(a, 'isNative') || Object.prototype.hasOwnProperty.call(a, 'address')) {
    return true
  }
  return false
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
