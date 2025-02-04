import { CurrencyAmount, type Currency } from '@pancakeswap/ton-v2-sdk'
import { parseUnits } from '@pancakeswap/utils/viem/parseUnits'

export function tryParseAmount<T extends Currency>(value?: string, currency?: T | null): CurrencyAmount<T> | undefined {
  if (!value || !currency) {
    return undefined
  }
  try {
    const typedValueParsed = parseUnits(value as `${number}`, currency.decimals).toString()

    if (typedValueParsed !== '0') {
      return CurrencyAmount.fromRawAmount(currency, BigInt(typedValueParsed))
    }
  } catch (error) {
    // should fail if the user specifies too many decimal places of precision (or maybe exceed max uint?)
    console.debug(`Failed to parse input amount: "${value}"`, error)
  }
  // necessary for all paths to return a value
  return undefined
}
