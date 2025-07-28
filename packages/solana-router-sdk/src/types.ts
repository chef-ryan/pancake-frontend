import { BigintIsh, Currency, CurrencyAmount, TradeType } from '@pancakeswap/sdk'
import { AbortControl } from '@pancakeswap/utils/abortControl'

export interface SmartRouterTrade<TTradeType extends TradeType> {
  tradeType: TTradeType
  inputAmount: CurrencyAmount<Currency>
  inputAmountWithGasAdjusted?: CurrencyAmount<Currency>
  outputAmount: CurrencyAmount<Currency>
  outputAmountWithGasAdjusted?: CurrencyAmount<Currency>

  // todo:@eric
  routes: any[]

  gasEstimate: bigint
  gasEstimateInUSD?: CurrencyAmount<Currency>
  blockNumber?: number
  quoteQueryHash?: string
}

export type PriceReferences = {
  quoteCurrencyUsdPrice?: number
  nativeCurrencyUsdPrice?: number
}

export type BaseTradeConfig = {
  gasPriceWei: BigintIsh | (() => Promise<BigintIsh>)
  maxHops?: number
  maxSplits?: number
  distributionPercent?: number
}

export type TradeConfig = BaseTradeConfig & {
  blockNumber?: number | (() => Promise<number>)
  quoterOptimization?: boolean
  quoteId?: string
} & PriceReferences &
  AbortControl

export type RouteConfig = TradeConfig & {
  blockNumber?: number
}
