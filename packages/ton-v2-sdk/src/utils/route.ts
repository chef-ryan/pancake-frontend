import invariant from 'tiny-invariant'
import { Currency, Price } from '../constants'
import { Pair } from '../types'

export class Route<TInput extends Currency, TOutput extends Currency> {
  public readonly pairs: Pair[]

  public readonly path: Currency[]

  public readonly input: TInput

  public readonly output: TOutput

  public constructor(pairs: Pair[], input: TInput, output: TOutput) {
    this.pairs = pairs
    const wrappedInput = input.wrapped
    const path: Currency[] = [wrappedInput]
    for (const [i, pair] of pairs.entries()) {
      const currentInput = path[i]
      invariant(currentInput.equals(pair.token0) || currentInput.equals(pair.token1), 'PATH')
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const output = currentInput.equals(pair.token0) ? pair.token1 : pair.token0
      path.push(output)
    }
    this.path = path
    this.input = input
    this.output = output
  }

  private _midPrice: Price<TInput, TOutput> | null = null

  public get midPrice(): Price<TInput, TOutput> {
    if (this._midPrice !== null) return this._midPrice
    const prices: Price<Currency, Currency>[] = []
    for (const [i, pair] of this.pairs.entries()) {
      prices.push(
        this.path[i].equals(pair.token0)
          ? new Price(pair.reserve0.currency, pair.reserve1.currency, pair.reserve0.quotient, pair.reserve1.quotient)
          : new Price(pair.reserve1.currency, pair.reserve0.currency, pair.reserve1.quotient, pair.reserve0.quotient),
      )
    }
    const reduced = prices.slice(1).reduce((accumulator, currentValue) => accumulator.multiply(currentValue), prices[0])
    this._midPrice = new Price(this.input, this.output, reduced.denominator, reduced.numerator)
    return this._midPrice
  }

  public get chainId(): number {
    return this.pairs[0].chainId
  }
}
