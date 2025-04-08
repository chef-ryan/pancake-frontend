import { SmartRouter, SmartRouterTrade } from '@pancakeswap/smart-router'
import { TradeType } from '@pancakeswap/swap-sdk-core'
import { bestTradeHookFactory } from './bestTradeHookFactory'
import { createQuoteProvider } from './createQuoteProvider'
import { createSimpleUseGetBestTradeHook } from './createSimpleUseGetBestTradeHook'
import { useCommonPoolsLite } from './useCommonPools'

export const useBestAMMTradeFromQuoter = bestTradeHookFactory<SmartRouterTrade<TradeType>>({
  key: 'useBestAMMTradeFromQuoter',
  useCommonPools: useCommonPoolsLite,
  createQuoteProvider,
  useGetBestTrade: createSimpleUseGetBestTradeHook(SmartRouter.getBestTrade),
  // Since quotes are fetched on chain, which relies on network IO, not calculated offchain, we don't need to further optimize
  quoterOptimization: false,
})
