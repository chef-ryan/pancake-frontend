import {
  _10000,
  _9975,
  CurrencyAmount,
  InsufficientInputAmountError,
  InsufficientReservesError,
  ONE,
  Price,
  ZERO,
} from '@pancakeswap/swap-sdk-core'
import keccak256 from 'keccak256'
import invariant from 'tiny-invariant'
import { Currency } from './currency'
import { sortBefore } from './util/sortBefore'

export class Pair {
  private reserves: [CurrencyAmount<Currency>, CurrencyAmount<Currency>]

  constructor(reserveA: CurrencyAmount<Currency>, reserveB: CurrencyAmount<Currency>) {
    // Ensure the order is correct based on `sortBefore`
    if (sortBefore(reserveA, reserveB)) {
      this.reserves = [reserveA, reserveB]
    } else {
      this.reserves = [reserveB, reserveA]
    }
  }

  public static fromTokens(amountA: CurrencyAmount<Currency>, amountB: CurrencyAmount<Currency>): Pair {
    return new Pair(amountA, amountB)
  }

  // ----- Getters -----
  public get currency0(): Currency {
    return this.reserves[0].currency
  }

  public get currency1(): Currency {
    return this.reserves[1].currency
  }

  public get reserve0(): CurrencyAmount<Currency> {
    return this.reserves[0]
  }

  public get reserve1(): CurrencyAmount<Currency> {
    return this.reserves[1]
  }

  // ----- Core Logic -----
  public hash(): string {
    const firstAddress = this.reserves[0].currency.wrapped.address
    const secondAddress = this.reserves[1].currency.wrapped.address
    return keccak256(`${firstAddress}/${secondAddress}`).toString('hex')
  }

  public priceOf(currency: Currency): Price<Currency, Currency> {
    invariant(this.involvesCurrency(currency), 'TOKEN')
    return currency.equals(this.currency0) ? this.currency0Price : this.currency1Price
  }

  public involvesCurrency(currency: Currency): boolean {
    return currency.equals(this.currency0) || currency.equals(this.currency1)
  }

  public get currency0Price(): Price<Currency, Currency> {
    const result = this.reserve1.divide(this.reserve0)
    return new Price(this.currency0, this.currency1, result.denominator, result.numerator)
  }

  public get currency1Price(): Price<Currency, Currency> {
    const result = this.reserve0.divide(this.reserve1)
    return new Price(this.currency1, this.currency0, result.denominator, result.numerator)
  }

  public reserveOf(currency: Currency): CurrencyAmount<Currency> {
    invariant(this.involvesCurrency(currency), 'TOKEN')
    return currency.equals(this.currency0) ? this.reserve0 : this.reserve1
  }

  // Calculate how much output token you'll get for a given input token amount
  public getOutputAmount(inputAmount: CurrencyAmount<Currency>): [CurrencyAmount<Currency>, Pair] {
    invariant(this.involvesCurrency(inputAmount.currency), 'TOKEN')

    if (this.reserve0.quotient === ZERO || this.reserve1.quotient === ZERO) {
      throw new InsufficientReservesError()
    }

    const inputReserve = this.reserveOf(inputAmount.currency)
    const outputCurrency = inputAmount.currency.equals(this.currency0) ? this.currency1 : this.currency0
    const outputReserve = this.reserveOf(outputCurrency)

    // Constant product formula adjusted by fee
    const inputAmountWithFee = inputAmount.quotient * _9975
    const numerator = inputAmountWithFee * outputReserve.quotient
    const denominator = inputReserve.quotient * _10000 + inputAmountWithFee
    const outputRawAmount = numerator / denominator

    // If output is 0, it's insufficient input
    if (outputRawAmount === ZERO) {
      throw new InsufficientInputAmountError()
    }

    const outputAmount = CurrencyAmount.fromRawAmount(outputCurrency, outputRawAmount)

    // Return updated reserves in a new Pair
    const updatedPair = new Pair(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount))

    return [outputAmount, updatedPair]
  }

  // Calculate how much input token you'll need to get a specified output token amount
  public getInputAmount(outputAmount: CurrencyAmount<Currency>): [CurrencyAmount<Currency>, Pair] {
    invariant(this.involvesCurrency(outputAmount.currency), 'TOKEN')

    if (
      this.reserve0.quotient === ZERO ||
      this.reserve1.quotient === ZERO ||
      outputAmount.quotient >= this.reserveOf(outputAmount.currency).quotient
    ) {
      throw new InsufficientReservesError()
    }

    const outputReserve = this.reserveOf(outputAmount.currency)
    const inputCurrency = outputAmount.currency.equals(this.currency0) ? this.currency1 : this.currency0
    const inputReserve = this.reserveOf(inputCurrency)

    // Constant product formula adjusted by fee
    const numerator = inputReserve.quotient * outputAmount.quotient * _10000
    const denominator = (outputReserve.quotient - outputAmount.quotient) * _9975
    const inputRawAmount = numerator / denominator + ONE // rounding up

    const inputAmount = CurrencyAmount.fromRawAmount(inputCurrency, inputRawAmount)

    // Return updated reserves in a new Pair
    const updatedPair = new Pair(inputReserve.add(inputAmount), outputReserve.subtract(outputAmount))

    return [inputAmount, updatedPair]
  }
}
