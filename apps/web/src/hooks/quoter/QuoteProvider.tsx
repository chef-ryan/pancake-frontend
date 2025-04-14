import { useDebounce } from '@orbs-network/twap-ui/dist/hooks'
import { ClassicOrder, OrderType } from '@pancakeswap/price-api-sdk'
import { CurrencyAmount, TradeType } from '@pancakeswap/swap-sdk-core'
import tryParseAmount from '@pancakeswap/utils/tryParseAmount'
import { POOLS_FAST_REVALIDATE } from 'config/pools'
import { useInputBasedAutoSlippageWithFallback } from 'hooks/useAutoSlippageWithFallback'
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai'
import { Suspense, useEffect } from 'react'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import { useAccount } from 'wagmi'
import { useCurrency } from '../Tokens'
import { bestQuoteAtom } from './atom/bestQuoteAtom'
import { poolRevalidateAtom, quoteRevalidateAtom } from './atom/revalidateAtom'
import { createQuoteOption } from './createQuoteOption'
import { QuoteContextProvider, useQuoteContext } from './QuoteContext'
import { useAllTypeBestTrade } from './useAllTypeBestTrade'
import { LoadedValue } from './utils/LoadedValue'

export const QuoteProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QuoteContextProvider>
      <Suspense
        fallback={
          <div
            style={{
              minHeight: '100vh',
            }}
          />
        }
      >
        {children}
      </Suspense>
      <Suspense fallback={null}>
        <QuoteSync />
      </Suspense>
    </QuoteContextProvider>
  )
}

type QuoterFunctionType = typeof useAllTypeBestTrade

const baseAllTypeBestTradeAtom = atom<ReturnType<QuoterFunctionType>>({
  ammOrder: undefined,
  xOrder: undefined,
  betterOrder: undefined,
  bestOrder: undefined,
  tradeLoaded: false,
  tradeError: undefined,
  refreshDisabled: false,
  refreshOrder: () => {},
  refreshTrade: () => {},
  pauseQuoting: () => {},
  resumeQuoting: () => {},
})

const allTypeBestTradeAtom = atom((get) => {
  const state = get(baseAllTypeBestTradeAtom)
  const loading = get(loadingAtom)
  return {
    ...state,
    tradeLoaded: !loading && state.tradeLoaded,
  }
})

export const useAllTypeBestTradeSync = () => {
  const allTypeBestTrade = useAtomValue(allTypeBestTradeAtom)
  return allTypeBestTrade
}

const REVALIDATE_TIME = 10
const loadingAtom = atom(false)
const parseAtom = atom(false)
const QuoteSync = () => {
  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()
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
  const setLoading = useSetAtom(loadingAtom)
  const [paused, pauseQuote] = useAtom(parseAtom)
  const debouncedAmount = useDebounce(
    amount ? CurrencyAmount.fromRawAmount(amount.currency, amount.quotient) : undefined,
    300,
  )
  const { slippageTolerance: slippage } = useInputBasedAutoSlippageWithFallback(amount)
  const quoteOption = createQuoteOption({
    amount: debouncedAmount,
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
  })

  const revalidateQuote = useSetAtom(quoteRevalidateAtom(quoteOption))
  const revalidatePools = useSetAtom(poolRevalidateAtom)

  useEffect(() => {
    setLoading(true)
  }, [typedValue, setLoading])

  const quoteResult = useAtomValue(bestQuoteAtom(quoteOption))
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
          revalidatePools(quoteOption)
        }
      }
      t++
    }, 1000)

    return () => {
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteOption.hash, paused, quoteResult.loading])

  useEffect(() => {
    // @ts-ignore
    const trade = {
      isLoading: quoteResult.loading,
      type: OrderType.PCS_CLASSIC,
      trade: quoteResult.data,
    } as LoadedValue<ClassicOrder> | undefined

    setTrade({
      ammOrder: undefined,
      xOrder: undefined,
      betterOrder: undefined,
      bestOrder: trade,
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
    setLoading(false)
  }, [quoteResult.data, quoteResult.loading, quoteResult.error, pauseQuote, setTrade, setLoading, revalidateQuote])

  return null
}
