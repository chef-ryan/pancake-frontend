import { TradeType } from '@pancakeswap/swap-sdk-core'
import { QuoteResult, UseBetterQuoteOptions } from './quoter.types'

export function getBetterQuote<A extends QuoteResult, B extends QuoteResult>(
  quoteA?: A,
  quoteB?: B,
  options?: UseBetterQuoteOptions,
): A | B | undefined
export function getBetterQuote<A extends QuoteResult, B extends QuoteResult>(
  quoteA: A,
  quoteB: B,
  options: UseBetterQuoteOptions | undefined,
): A | B
export function getBetterQuote<A extends QuoteResult, B extends QuoteResult>(
  quoteA?: A,
  quoteB?: B,
  options?: UseBetterQuoteOptions,
): A | B | undefined {
  const { factorGasCost = true } = options || {}
  if (!quoteB?.trade || (!quoteA?.trade && !quoteB?.trade)) {
    return quoteA
  }
  if (!quoteA?.trade) {
    return quoteB
  }
  // prioritize quoteA. Use quoteB as fallback
  if (quoteA.isLoading && !quoteA.error) {
    return quoteA
  }
  return quoteA.trade.tradeType === TradeType.EXACT_INPUT
    ? (
        (factorGasCost ? quoteB.trade.outputAmountWithGasAdjusted : undefined) ?? quoteB.trade.outputAmount
      )?.greaterThan(
        (factorGasCost ? quoteA.trade!.outputAmountWithGasAdjusted : undefined) ?? quoteA.trade!.outputAmount,
      )
      ? quoteB
      : quoteA
    : ((factorGasCost ? quoteB.trade.inputAmountWithGasAdjusted : undefined) ?? quoteB.trade.inputAmount)?.lessThan(
        (factorGasCost ? quoteA.trade!.inputAmountWithGasAdjusted : undefined) ?? quoteA.trade!.inputAmount,
      )
    ? quoteB
    : quoteA
}
