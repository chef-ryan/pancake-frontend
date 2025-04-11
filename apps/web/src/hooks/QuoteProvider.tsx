import { ClassicOrder, OrderType } from '@pancakeswap/price-api-sdk'
import { TradeType } from '@pancakeswap/swap-sdk-core'
import tryParseAmount from '@pancakeswap/utils/tryParseAmount'
import { useUserSingleHopOnly } from '@pancakeswap/utils/user'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { createContext, Suspense, useContext, useEffect } from 'react'
import { Field } from 'state/swap/actions'
import { useSwapState } from 'state/swap/hooks'
import {
  useUserInfinitySwapEnable,
  useUserSplitRouteEnable,
  useUserStableSwapEnable,
  useUserV2SwapEnable,
  useUserV3SwapEnable,
} from 'state/user/smartRouter'
import { bestAMMTradeFromQuoterWorkerAtom } from './quoter/atom/bestAMMTradeFromQuoterWorkerAtom'
import { quoteTimerAtom } from './quoter/atom/quoteTimerAtom'
import { useAllTypeBestTrade } from './quoter/useAllTypeBestTrade'
import { useMulticallGasLimit } from './quoter/useMulticallGasLimit'
import { LoadedValue } from './quoter/utils/LoadedValue'
import { useCurrency } from './Tokens'

interface QuoteContext {
  multicallGasLimit?: bigint
  singleHopOnly?: boolean
  split?: boolean
  v2Swap?: boolean
  v3Swap?: boolean
  infinitySwap?: boolean
  stableSwap?: boolean
  maxHops: number
}
const QuoteContext = createContext<QuoteContext>({
  multicallGasLimit: undefined,
  singleHopOnly: false,
  split: false,
  v2Swap: true,
  v3Swap: true,
  infinitySwap: true,
  stableSwap: true,
  maxHops: 3,
})

export const QuoteProvider = ({ children }: { children: React.ReactNode }) => {
  const limit = useMulticallGasLimit()

  const [singleHopOnly] = useUserSingleHopOnly()
  const [split] = useUserSplitRouteEnable()
  const [v2Swap] = useUserV2SwapEnable()
  const [v3Swap] = useUserV3SwapEnable()
  const [infinitySwap] = useUserInfinitySwapEnable()
  const [stableSwap] = useUserStableSwapEnable()

  return (
    <QuoteContext.Provider
      value={{
        multicallGasLimit: limit,
        singleHopOnly,
        split,
        v2Swap,
        v3Swap,
        infinitySwap,
        stableSwap,
        maxHops: 3,
      }}
    >
      {children}
      <Suspense fallback={null}>
        <Sync />
      </Suspense>
    </QuoteContext.Provider>
  )
}

type QuoterFunctionType = typeof useAllTypeBestTrade

const allTypeBestTradeAtom = atom<ReturnType<QuoterFunctionType>>({
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

export const useAllTypeBestTradeSync = () => {
  const allTypeBestTrade = useAtomValue(allTypeBestTradeAtom)
  return allTypeBestTrade
}

const Sync = () => {
  const {
    independentField,
    typedValue,
    [Field.INPUT]: { currencyId: inputCurrencyId },
    [Field.OUTPUT]: { currencyId: outputCurrencyId },
  } = useSwapState()
  const inputCurrency = useCurrency(inputCurrencyId)
  const outputCurrency = useCurrency(outputCurrencyId)
  const isExactIn = independentField === Field.INPUT
  const independentCurrency = isExactIn ? inputCurrency : outputCurrency
  const dependentCurrency = isExactIn ? outputCurrency : inputCurrency
  const tradeType = isExactIn ? TradeType.EXACT_INPUT : TradeType.EXACT_OUTPUT
  const amount = tryParseAmount(typedValue, independentCurrency ?? undefined)
  const { singleHopOnly, split, v2Swap, v3Swap, infinitySwap, stableSwap, maxHops } = useContext(QuoteContext)
  const setTrade = useSetAtom(allTypeBestTradeAtom)
  const setQuoteTimer = useSetAtom(quoteTimerAtom)

  // Sync quoter timer
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteTimer(Math.floor(Date.now() / 1000))
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  const order = useAtomValue(
    bestAMMTradeFromQuoterWorkerAtom({
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
    }),
  )

  useEffect(() => {
    // @ts-ignore
    const trade = {
      refresh: () => {},
      syncing: false,
      isStale: false,
      error: undefined,
      isLoading: false,
      type: OrderType.PCS_CLASSIC,
      trade: order,
    } as LoadedValue<ClassicOrder>
    setTrade({
      ammOrder: undefined,
      xOrder: undefined,
      betterOrder: undefined,
      bestOrder: trade,
      tradeLoaded: true,
      tradeError: undefined,
      refreshDisabled: false,
      refreshOrder: () => {},
      refreshTrade: () => {},
      pauseQuoting: () => {},
      resumeQuoting: () => {},
    })
  }, [order])

  return null
}
