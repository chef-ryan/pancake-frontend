import { SmartRouter, SmartRouterTrade } from '@pancakeswap/smart-router'
import { TradeType } from '@pancakeswap/swap-sdk-core'
import { bestTradeHookFactory } from './bestTradeHookFactory'
import { createSimpleUseGetBestTradeHook } from './createSimpleUseGetBestTradeHook'
import { useCommonPools } from './useCommonPools'

export const useBestAMMTradeFromOffchain = bestTradeHookFactory<SmartRouterTrade<TradeType>>({
  key: 'useBestAMMTradeFromOffchain',
  useCommonPools,
  useGetBestTrade: createSimpleUseGetBestTradeHook(SmartRouter.getBestTrade),
  createQuoteProvider: SmartRouter.createOffChainQuoteProvider,
})
