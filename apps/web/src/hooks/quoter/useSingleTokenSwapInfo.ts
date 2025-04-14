import { Currency, Price, TradeType } from '@pancakeswap/swap-sdk-core'
import tryParseAmount from '@pancakeswap/utils/tryParseAmount'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useAtomValue } from 'jotai'
import { getTokenAddress } from 'views/Swap/components/Chart/utils'
import { bestQuoteAtom } from './atom/bestQuoteAtom'
import { createQuoteOption } from './createQuoteOption'

interface Query {
  inputCurrencyId?: string
  inputCurrency?: Currency
  outputCurrencyId?: string
  outputCurrency?: Currency
}
export function useSingleTokenSwapInfo(query: Query): { [key: string]: number } {
  const { inputCurrencyId, inputCurrency, outputCurrencyId, outputCurrency } = query
  const { chainId } = useActiveChainId()
  const token0Address = getTokenAddress(chainId, inputCurrencyId)
  const token1Address = getTokenAddress(chainId, outputCurrencyId)
  const amount = tryParseAmount('1', inputCurrency ?? undefined)

  const quoteOption = createQuoteOption({
    amount,
    baseCurrency: inputCurrency ?? undefined,
    currency: outputCurrency ?? undefined,
    tradeType: TradeType.EXACT_INPUT,
    maxHops: 1,
    maxSplits: 0,
    v2Swap: true,
    v3Swap: true,
    stableSwap: true,
    xEnabled: false,
    speedQuoteEnabled: true,
  })

  const quoteResult = useAtomValue(bestQuoteAtom(quoteOption))
  const bestTradeExactIn = quoteResult.data
  if (!inputCurrency || !outputCurrency || !bestTradeExactIn) {
    return {}
  }

  let inputTokenPrice = 0
  try {
    inputTokenPrice = parseFloat(
      new Price({
        baseAmount: bestTradeExactIn.inputAmount,
        quoteAmount: bestTradeExactIn.outputAmount,
      }).toSignificant(6),
    )
  } catch (error) {
    //
  }
  if (!inputTokenPrice) {
    return {}
  }
  const outputTokenPrice = 1 / inputTokenPrice

  return {
    [token0Address]: inputTokenPrice,
    [token1Address]: outputTokenPrice,
  }
}
