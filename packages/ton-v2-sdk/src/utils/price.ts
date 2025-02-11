import invariant from 'tiny-invariant'
import { Currency, CurrencyAmount, Price } from '../constants'

export const token0Price = (
  amount0: CurrencyAmount<Currency>,
  amount1: CurrencyAmount<Currency>,
): Price<Currency, Currency> => {
  const [amountA, amountB] = amount0.currency.wrapped.sortsBefore(amount1.wrapped.currency)
    ? [amount0, amount1]
    : [amount1, amount0]
  const result = amountB.divide(amountA)
  return new Price(amountA.currency, amountB.currency, result.denominator, result.numerator)
}

export const token1Price = (
  amount0: CurrencyAmount<Currency>,
  amount1: CurrencyAmount<Currency>,
): Price<Currency, Currency> => {
  const [amountA, amountB] = amount0.currency.wrapped.sortsBefore(amount1.wrapped.currency)
    ? [amount0, amount1]
    : [amount1, amount0]
  const result = amountA.divide(amountB)
  return new Price(amountB.currency, amountA.currency, result.denominator, result.numerator)
}

/**
 * Return the price of the given token in terms of the other token in the pool.
 * @param token The token to return price of
 * @returns The price of the given token, in terms of the other.
 */
export function priceOf(
  token: Currency,
  amount0: CurrencyAmount<Currency>,
  amount1: CurrencyAmount<Currency>,
): Price<Currency, Currency> {
  invariant(token.equals(amount0.currency) || token.equals(amount1.currency), 'TOKEN')
  const [amountA] = amount0.currency.wrapped.sortsBefore(amount1.wrapped.currency)
    ? [amount0, amount1]
    : [amount1, amount0]
  return token.wrapped.equals(amountA.currency.wrapped) ? token0Price(amount0, amount1) : token1Price(amount0, amount1)
}
