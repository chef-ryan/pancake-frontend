import { useDebounce } from '@orbs-network/twap-ui/dist/hooks'
import { TradeType } from '@pancakeswap/swap-sdk-core'
import tryParseAmount from '@pancakeswap/utils/tryParseAmount'
import { POOLS_FAST_REVALIDATE } from 'config/pools'
import { useCurrency } from 'hooks/Tokens'
import { useInputBasedAutoSlippageWithFallback } from 'hooks/useAutoSlippageWithFallback'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { baseAllTypeBestTradeAtom, pauseAtom, userTypingAtom } from 'quoter/atom/bestTradeUISyncAtom'
import { useEffect } from 'react'
import { useCurrentBlock } from 'state/block/hooks'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import { useAccount } from 'wagmi'
import { bestQuoteAtom } from '../atom/bestQuoteAtom'
import { poolRevalidateAtom, quoteRevalidateAtom } from '../atom/revalidateAtom'
import { createQuoteQuery } from '../utils/createQuoteQuery'
import { useQuoteContext } from './QuoteContext'

const REVALIDATE_TIME = 10

export const useQuoterSync = () => {
  const swapState = useSwapState()
  const debouncedSwapState = useDebounce(swapState, 300)
  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = debouncedSwapState
  const { address } = useAccount()
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const isExactIn = independentField === Field.INPUT
  const independentCurrency = isExactIn ? inputCurrency : outputCurrency
  const dependentCurrency = isExactIn ? outputCurrency : inputCurrency
  const tradeType = isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT
  const amount = tryParseAmount(typedValue, independentCurrency ?? undefined)
  const {
    singleHopOnly,
    split,
    v2Swap,
    v3Swap,
    infinitySwap,
    stableSwap,
    maxHops,
    chainId,
    speedQuoteEnabled,
    xEnabled,
  } = useQuoteContext()
  const setTrade = useSetAtom(baseAllTypeBestTradeAtom)
  const setTyping = useSetAtom(userTypingAtom)
  const [paused, pauseQuote] = useAtom(pauseAtom)

  const { slippageTolerance: slippage } = useInputBasedAutoSlippageWithFallback(amount)
  const blockNumber = useCurrentBlock()

  const quoteQuery = createQuoteQuery({
    amount,
    currency: dependentCurrency,
    baseCurrency: independentCurrency,
    tradeType,
    maxHops: singleHopOnly ? 1 : maxHops,
    maxSplits: split ? undefined : 0,
    v2Swap,
    v3Swap,
    infinitySwap,
    stableSwap,
    speedQuoteEnabled,
    xEnabled,
    slippage,
    address,
    blockNumber,
  })

  const revalidateQuote = useSetAtom(quoteRevalidateAtom(quoteQuery))
  const revalidatePools = useSetAtom(poolRevalidateAtom)

  useEffect(() => {
    setTyping(true)
  }, [typedValue, setTyping])

  const quoteResult = useAtomValue(bestQuoteAtom(quoteQuery))
  useEffect(() => {
    let t = 0
    const pauseTimer = paused || quoteResult.loading
    const interval = setInterval(() => {
      if (pauseTimer) {
        return
      }
      if (t > 0) {
        if (t % REVALIDATE_TIME === 0) {
          revalidateQuote((v) => v + 1)
        }
        const poolRevalidateTime = POOLS_FAST_REVALIDATE[chainId] * 10
        if (poolRevalidateTime && t % poolRevalidateTime === 0) {
          revalidatePools(quoteQuery)
        }
      }
      t++
    }, 1000)

    return () => {
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteQuery.hash, paused, quoteResult.loading])

  useEffect(() => {
    setTrade({
      bestOrder: quoteResult.data,
      tradeLoaded: !quoteResult?.loading,
      tradeError: quoteResult?.error,
      refreshDisabled: false,
      refreshOrder: () => {
        revalidateQuote((v) => v + 1)
      },
      refreshTrade: () => {
        revalidateQuote((v) => v + 1)
      },
      pauseQuoting: () => {
        pauseQuote(true)
      },
      resumeQuoting: () => {
        pauseQuote(false)
      },
    })
    setTyping(false)
  }, [quoteResult.data, quoteResult.loading, quoteResult.error, pauseQuote, setTrade, setTyping, revalidateQuote])
}
