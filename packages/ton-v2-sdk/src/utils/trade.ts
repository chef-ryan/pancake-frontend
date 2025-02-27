import invariant from 'tiny-invariant'
import {
  Fraction,
  InsufficientInputAmountError,
  InsufficientReservesError,
  ONE,
  Percent,
  TradeType,
  ZERO,
  sortedInsert,
} from '@pancakeswap/swap-sdk-core'
import { ONE_HUNDRED_PERCENT, ZERO_PERCENT } from '@pancakeswap/swap-sdk-evm'
import { Route } from './route'
import { Pair } from '../types'
import { getInputAmount, getOutputAmount } from './amount'
import { Currency } from '../currency'
import { CurrencyAmount } from '../fractions/CurrencyAmount'
import { Price } from '../fractions/Price'

// minimal interface so the input output comparator may be shared across types
interface InputOutput<TInput extends Currency, TOutput extends Currency> {
  readonly inputAmount: CurrencyAmount<TInput>
  readonly outputAmount: CurrencyAmount<TOutput>
}

// comparator function that allows sorting trades by their output amounts, in decreasing order, and then input amounts
// in increasing order. i.e. the best trades have the most outputs for the least inputs and are sorted first
export function inputOutputComparator<TInput extends Currency, TOutput extends Currency>(
  a: InputOutput<TInput, TOutput>,
  b: InputOutput<TInput, TOutput>,
): number {
  // must have same input and output token for comparison
  invariant(a.inputAmount.currency.equals(b.inputAmount.currency), 'INPUT_CURRENCY')
  invariant(a.outputAmount.currency.equals(b.outputAmount.currency), 'OUTPUT_CURRENCY')
  if (a.outputAmount.equalTo(b.outputAmount)) {
    if (a.inputAmount.equalTo(b.inputAmount)) {
      return 0
    }
    // trade A requires less input than trade B, so A should come first
    if (a.inputAmount.lessThan(b.inputAmount)) {
      return -1
    }
    return 1
  }
  // tradeA has less output than trade B, so should come second
  if (a.outputAmount.lessThan(b.outputAmount)) {
    return 1
  }
  return -1
}

// extension of the input output comparator that also considers other dimensions of the trade in ranking them
export function tradeComparator<TInput extends Currency, TOutput extends Currency, TTradeType extends TradeType>(
  a: Trade<TInput, TOutput, TTradeType>,
  b: Trade<TInput, TOutput, TTradeType>,
) {
  const ioComp = inputOutputComparator(a, b)
  if (ioComp !== 0) {
    return ioComp
  }

  // consider lowest slippage next, since these are less likely to fail
  if (a.priceImpact.lessThan(b.priceImpact)) {
    return -1
  }
  if (a.priceImpact.greaterThan(b.priceImpact)) {
    return 1
  }

  // finally consider the number of hops since each hop costs gas
  return a.route.path.length - b.route.path.length
}
interface BestTradeOptions {
  // how many results to return
  maxNumResults?: number
  // the maximum number of hops a trade should contain
  maxHops?: number
}

export class Trade<TInput extends Currency, TOutput extends Currency, TTradeType extends TradeType> {
  /**
   * The route of the trade, i.e. which pairs the trade goes through and the input/output currencies.
   */
  public readonly route: Route<TInput, TOutput>

  /**
   * The type of the trade, either exact in or exact out.
   */
  public readonly tradeType: TTradeType

  /**
   * The input amount for the trade assuming no slippage.
   */
  public readonly inputAmount: CurrencyAmount<TInput>

  /**
   * The output amount for the trade assuming no slippage.
   */
  public readonly outputAmount: CurrencyAmount<TOutput>

  /**
   * The price expressed in terms of output amount/input amount.
   */
  public readonly executionPrice: Price<TInput, TOutput>

  /**
   * The percent difference between the mid price before the trade and the trade execution price.
   */
  public readonly priceImpact: Percent

  constructor(
    route: Route<TInput, TOutput>,
    amount: TTradeType extends TradeType.EXACT_INPUT ? CurrencyAmount<TInput> : CurrencyAmount<TOutput>,
    tradeType: TTradeType,
  ) {
    this.route = route
    this.tradeType = tradeType

    const tokenAmounts: CurrencyAmount<Currency>[] = new Array(route.path.length)
    if (tradeType === TradeType.EXACT_INPUT) {
      invariant(amount.currency.equals(route.input), 'INPUT')
      tokenAmounts[0] = amount.wrapped
      for (let i = 0; i < route.path.length - 1; i++) {
        const pair = route.pairs[i]
        const [outputAmount] = getOutputAmount(tokenAmounts[i], pair)
        tokenAmounts[i + 1] = outputAmount
      }
      this.inputAmount = CurrencyAmount.fromFractionalAmount(route.input, amount.numerator, amount.denominator)
      this.outputAmount = CurrencyAmount.fromFractionalAmount(
        route.output,
        tokenAmounts[tokenAmounts.length - 1].numerator,
        tokenAmounts[tokenAmounts.length - 1].denominator,
      )
    } else {
      invariant(amount.currency.equals(route.output), 'OUTPUT')
      tokenAmounts[tokenAmounts.length - 1] = amount.wrapped
      for (let i = route.path.length - 1; i > 0; i--) {
        const pair = route.pairs[i - 1]
        const [inputAmount] = getOutputAmount(tokenAmounts[i], pair)
        tokenAmounts[i - 1] = inputAmount
      }
      this.inputAmount = CurrencyAmount.fromFractionalAmount(
        route.input,
        tokenAmounts[0].numerator,
        tokenAmounts[0].denominator,
      )
      this.outputAmount = CurrencyAmount.fromFractionalAmount(route.output, amount.numerator, amount.denominator)
    }

    this.executionPrice = new Price(
      this.inputAmount.currency,
      this.outputAmount.currency,
      this.inputAmount.quotient,
      this.outputAmount.quotient,
    )
    // calculate price impact := (exactQuote - outputAmount) / exactQuote
    const quotedOutputAmount = route.midPrice.quote(this.inputAmount)
    const priceImpact = quotedOutputAmount.subtract(this.outputAmount).divide(quotedOutputAmount)
    this.priceImpact = new Percent(priceImpact.numerator, priceImpact.denominator)
  }

  /**
   * Get the minimum amount that must be received from this trade for the given slippage tolerance
   * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
   */
  public minimumAmountOut(slippageTolerance: Percent): CurrencyAmount<TOutput> {
    invariant(!slippageTolerance.lessThan(ZERO), 'SLIPPAGE_TOLERANCE')
    if (this.tradeType === TradeType.EXACT_OUTPUT) {
      return this.outputAmount
    }
    const slippageAdjustedAmountOut = new Fraction(ONE)
      .add(slippageTolerance)
      .invert()
      .multiply(this.outputAmount.quotient).quotient
    return CurrencyAmount.fromRawAmount(this.outputAmount.currency, slippageAdjustedAmountOut)
  }

  /**
   * Get the maximum amount in that can be spent via this trade for the given slippage tolerance
   * @param slippageTolerance tolerance of unfavorable slippage from the execution price of this trade
   */
  public maximumAmountIn(slippageTolerance: Percent): CurrencyAmount<TInput> {
    invariant(!slippageTolerance.lessThan(ZERO), 'SLIPPAGE_TOLERANCE')
    if (this.tradeType === TradeType.EXACT_INPUT) {
      return this.inputAmount
    }
    const slippageAdjustedAmountIn = new Fraction(ONE)
      .add(slippageTolerance)
      .multiply(this.inputAmount.quotient).quotient
    return CurrencyAmount.fromRawAmount(this.inputAmount.currency, slippageAdjustedAmountIn)
  }
}

export const bestTradeExactOut = <TInput extends Currency, TOutput extends Currency>(
  pairs: Pair[],
  currencyIn: TInput,
  currencyAmountOut: CurrencyAmount<TOutput>,
  { maxNumResults = 3, maxHops = 3 }: BestTradeOptions = {},
  // used in recursion.
  currentPairs: Pair[] = [],
  nextAmountOut: CurrencyAmount<Currency> = currencyAmountOut,
  bestTrades: Trade<TInput, TOutput, TradeType.EXACT_OUTPUT>[] = [],
): Trade<TInput, TOutput, TradeType.EXACT_OUTPUT>[] => {
  invariant(pairs.length > 0, 'PAIRS')
  invariant(maxHops > 0, 'MAX_HOPS')
  invariant(currencyAmountOut === nextAmountOut || currentPairs.length > 0, 'INVALID_RECURSION')

  const amountOut = nextAmountOut.wrapped
  const tokenIn = currencyIn.wrapped
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i]
    // pair irrelevant
    if (!pair.token0.wrapped.equals(amountOut.currency) && !pair.token1.wrapped.equals(amountOut.currency)) continue
    if (pair.reserve0.equalTo(ZERO) || pair.reserve1.equalTo(ZERO)) continue

    let amountIn: CurrencyAmount<Currency>
    try {
      // eslint-disable-next-line @typescript-eslint/no-extra-semi
      ;[amountIn] = getInputAmount(amountOut, pair)
    } catch (error) {
      // not enough liquidity in this pair
      if ((error as InsufficientReservesError).isInsufficientReservesError) {
        continue
      }
      throw error
    }
    // we have arrived at the input token, so this is the first trade of one of the paths
    if (amountIn.currency.wrapped.equals(tokenIn)) {
      sortedInsert(
        bestTrades,
        new Trade(
          new Route([pair, ...currentPairs], currencyIn, currencyAmountOut.currency),
          currencyAmountOut,
          TradeType.EXACT_OUTPUT,
        ),
        maxNumResults,
        tradeComparator,
      )
    } else if (maxHops > 1 && pairs.length > 1) {
      const pairsExcludingThisPair = pairs.slice(0, i).concat(pairs.slice(i + 1, pairs.length))

      // otherwise, consider all the other paths that arrive at this token as long as we have not exceeded maxHops
      bestTradeExactOut(
        pairsExcludingThisPair,
        currencyIn,
        currencyAmountOut,
        {
          maxNumResults,
          maxHops: maxHops - 1,
        },
        [pair, ...currentPairs],
        amountIn,
        bestTrades,
      )
    }
  }

  return bestTrades
}

export const bestTradeExactIn = <TInput extends Currency, TOutput extends Currency>(
  pairs: Pair[],
  currencyAmountIn: CurrencyAmount<TInput>,
  currencyOut: TOutput,
  { maxNumResults = 3, maxHops = 3 }: BestTradeOptions = {},
  currentPairs: Pair[] = [],
  nextAmountIn: CurrencyAmount<Currency> = currencyAmountIn,
  bestTrades: Trade<TInput, TOutput, TradeType.EXACT_INPUT>[] = [],
): Trade<TInput, TOutput, TradeType.EXACT_INPUT>[] => {
  invariant(pairs.length > 0, 'PAIRS')
  invariant(maxHops > 0, 'MAX_HOPS')
  invariant(currencyAmountIn === nextAmountIn || currentPairs.length > 0, 'INVALID_RECURSION')

  const amountIn = nextAmountIn.wrapped
  const tokenOut = currencyOut.wrapped
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i]
    // pair irrelevant
    if (!pair.token0.wrapped.equals(amountIn.currency) && !pair.token1.wrapped.equals(amountIn.currency)) continue
    if (pair.reserve0.equalTo(ZERO) || pair.reserve1.equalTo(ZERO)) continue

    let amountOut: CurrencyAmount<Currency>
    try {
      // eslint-disable-next-line @typescript-eslint/no-extra-semi
      ;[amountOut] = getOutputAmount(amountIn, pair)
    } catch (error) {
      // input too low
      if ((error as InsufficientInputAmountError).isInsufficientInputAmountError) {
        continue
      }
      throw error
    }
    // we have arrived at the output token, so this is the final trade of one of the paths
    if (amountOut.currency.wrapped.equals(tokenOut)) {
      sortedInsert(
        bestTrades,
        new Trade(
          new Route([...currentPairs, pair], currencyAmountIn.currency, currencyOut),
          currencyAmountIn,
          TradeType.EXACT_INPUT,
        ),
        maxNumResults,
        tradeComparator,
      )
    } else if (maxHops > 1 && pairs.length > 1) {
      const pairsExcludingThisPair = pairs.slice(0, i).concat(pairs.slice(i + 1, pairs.length))

      // otherwise, consider all the other paths that lead from this token as long as we have not exceeded maxHops
      bestTradeExactIn(
        pairsExcludingThisPair,
        currencyAmountIn,
        currencyOut,
        {
          maxNumResults,
          maxHops: maxHops - 1,
        },
        [...currentPairs, pair],
        amountOut,
        bestTrades,
      )
    }
  }

  return bestTrades
}

// returns whether tradeB is better than tradeA by at least a threshold percentage amount
export const isTradeBetter = (
  tradeA: Trade<Currency, Currency, TradeType> | undefined | null,
  tradeB: Trade<Currency, Currency, TradeType> | undefined | null,
  minimumDelta: Percent = ZERO_PERCENT,
): boolean | undefined => {
  if (tradeA && !tradeB) return false
  if (tradeB && !tradeA) return true
  if (!tradeA || !tradeB) return undefined

  if (
    tradeA.tradeType !== tradeB.tradeType ||
    !tradeA.inputAmount.currency.wrapped.equals(tradeB.inputAmount.currency.wrapped) ||
    !tradeA.outputAmount.currency.wrapped.equals(tradeB.outputAmount.currency.wrapped)
  ) {
    throw new Error('Trades are not comparable')
  }

  if (minimumDelta.equalTo(ZERO_PERCENT)) {
    return tradeA.executionPrice.lessThan(tradeB.executionPrice)
  }
  return tradeA.executionPrice.asFraction
    .multiply(minimumDelta.add(ONE_HUNDRED_PERCENT))
    .lessThan(tradeB.executionPrice)
}
