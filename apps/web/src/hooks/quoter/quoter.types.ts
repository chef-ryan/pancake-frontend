import type { InfinityRouter, QuoteProvider, SmartRouter } from '@pancakeswap/smart-router'
import type { Currency, CurrencyAmount, TradeType } from '@pancakeswap/swap-sdk-core'
import type { AbortControl } from '@pancakeswap/utils/abortControl'
import type { bestTradeHookFactory } from './bestTradeHookFactory'
import type { CommonPoolsParams, PoolsWithState } from './useCommonPools'
import type { LoadedValue } from './utils/LoadedValue'

export type CreateQuoteProviderParams = {
  gasLimit?: bigint
} & AbortControl

export type GetBestTradeParams = Parameters<typeof SmartRouter.getBestTrade>

export type InfinityGetBestTradeReturnType = Omit<
  Exclude<Awaited<ReturnType<typeof InfinityRouter.getBestTrade>>, undefined>,
  'graph'
>

export class NoValidRouteError extends Error {
  constructor(message?: string) {
    super(message)
    this.name = 'NoValidRouteError'
  }
}

export type UseBetterQuoteOptions = {
  factorGasCost?: false
}

export interface FactoryOptions<T> {
  // use to identify hook
  key: string
  useCommonPools: (currencyA?: Currency, currencyB?: Currency, params?: CommonPoolsParams) => PoolsWithState
  useGetBestTrade: () => (...args: GetBestTradeParams) => Promise<T | undefined | null>
  createQuoteProvider: (params: CreateQuoteProviderParams) => QuoteProvider

  // Decrease the size of batch getting quotes for better performance
  quoterOptimization?: boolean
}

export interface Options {
  amount?: CurrencyAmount<Currency>
  baseCurrency?: Currency | null
  currency?: Currency | null
  tradeType?: TradeType
  maxHops?: number
  maxSplits?: number
  v2Swap?: boolean
  v3Swap?: boolean
  infinitySwap?: boolean
  stableSwap?: boolean
  enabled?: boolean
  autoRevalidate?: boolean
  trackPerf?: boolean
  retry?: number | boolean
}

export type QuoteOption = Options

export interface useBestAMMTradeOptions extends Options {
  type?: 'offchain' | 'quoter' | 'auto' | 'api'
}

export type QuoteTrade = Pick<
  NonNullable<ReturnType<ReturnType<typeof bestTradeHookFactory>>['trade']>,
  'inputAmount' | 'outputAmount' | 'tradeType' | 'inputAmountWithGasAdjusted' | 'outputAmountWithGasAdjusted'
>

export type QuoteResult = LoadedValue<{
  trade?: QuoteTrade
}>
