import invariant from 'tiny-invariant'
import {
  Currency,
  CurrencyAmount,
  InsufficientInputAmountError,
  InsufficientReservesError,
  ONE,
  ZERO,
  _10000,
  _9975,
} from '@pancakeswap/swap-sdk-core'

interface SwapAmountParams {
  reserve0: CurrencyAmount<Currency>
  reserve1: CurrencyAmount<Currency>
  token0: Currency
  token1: Currency
}

export const getOutputAmount = (
  inputAmount: CurrencyAmount<Currency>,
  { reserve0, reserve1, token0, token1 }: SwapAmountParams,
): [CurrencyAmount<Currency>, SwapAmountParams] => {
  invariant(inputAmount.currency.equals(token0) || inputAmount.currency.equals(token1), 'TOKEN')
  if (reserve0.quotient === ZERO || reserve1.quotient === ZERO) {
    throw new InsufficientReservesError()
  }
  const [inputReserve, outputReserve] = inputAmount.currency.equals(token0)
    ? [reserve0, reserve1]
    : [reserve1, reserve0]
  const inputAmountWithFee = inputAmount.quotient * _9975
  const numerator = inputAmountWithFee * outputReserve.quotient
  const denominator = inputReserve.quotient * _10000 + inputAmountWithFee
  const outputAmount = CurrencyAmount.fromRawAmount(
    inputAmount.currency.equals(token0) ? token1 : token0,
    numerator / denominator,
  )
  if (outputAmount.quotient === ZERO) {
    throw new InsufficientInputAmountError()
  }
  return [
    outputAmount,
    {
      reserve0: reserve0.add(inputAmount),
      reserve1: reserve1.subtract(outputAmount),
      token0,
      token1,
    },
  ]
}

export const getInputAmount = (
  outputAmount: CurrencyAmount<Currency>,
  { token0, token1, reserve0, reserve1 }: SwapAmountParams,
): [CurrencyAmount<Currency>, SwapAmountParams] => {
  invariant(outputAmount.currency.equals(token0) || outputAmount.currency.equals(token1), 'TOKEN')
  const [outputReserve, inputReserve] = outputAmount.currency.equals(token0)
    ? [reserve0, reserve1]
    : [reserve1, reserve0]
  if (reserve0.quotient === ZERO || reserve1.quotient === ZERO || outputAmount.quotient >= outputReserve.quotient) {
    throw new InsufficientReservesError()
  }

  const numerator = inputReserve.quotient * outputAmount.quotient * _10000
  const denominator = (outputReserve.quotient - outputAmount.quotient) * _9975
  const inputAmount = CurrencyAmount.fromRawAmount(
    outputAmount.currency.equals(token0) ? token1 : token0,
    numerator / denominator + ONE,
  )
  return [
    inputAmount,
    {
      reserve0: reserve0.add(inputAmount),
      reserve1: reserve1.subtract(outputAmount),
      token0,
      token1,
    },
  ]
}
