import { TradeType } from '@pancakeswap/swap-sdk-core'
import { Currency } from '../constants'
import { CurrencyAmount } from '../constants/CurrencyAmount'

interface Pair {}
interface BestTradeOptions {
  // how many results to return
  maxNumResults?: number
  // the maximum number of hops a trade should contain
  maxHops?: number
}

interface TradeOutputType {
  inputAmount: CurrencyAmount<Currency> | undefined
  outputAmount: CurrencyAmount<Currency> | undefined
}

export class Trade<TInput extends Currency, TOutput extends Currency, TTradeType extends TradeType> {
  public static bestTradeExactOut<TInput extends Currency, TOutput extends Currency>(
    pairs: Pair[],
    currencyIn: TInput,
    currencyAmountOut: CurrencyAmount<TOutput>,
    { maxNumResults = 3, maxHops = 3 }: BestTradeOptions = {},
    // used in recursion.
    currentPairs: Pair[] = [],
    nextAmountOut: CurrencyAmount<Currency> = currencyAmountOut,
    bestTrades: Trade<TInput, TOutput, TradeType.EXACT_OUTPUT>[] = [],
  ): TradeOutputType {
    return {
      inputAmount: currencyAmountOut,
      outputAmount: currencyAmountOut,
    }
  }

  public static bestTradeExactIn<TInput extends Currency, TOutput extends Currency>(
    pairs: Pair[],
    currencyIn: TInput,
    currencyAmountOut: CurrencyAmount<TOutput>,
    { maxNumResults = 3, maxHops = 3 }: BestTradeOptions = {},
    // used in recursion.
    currentPairs: Pair[] = [],
    nextAmountOut: CurrencyAmount<Currency> = currencyAmountOut,
    bestTrades: Trade<TInput, TOutput, TradeType.EXACT_OUTPUT>[] = [],
  ): TradeOutputType {
    return {
      inputAmount: currencyAmountOut,
      outputAmount: currencyAmountOut,
    }
  }
}
