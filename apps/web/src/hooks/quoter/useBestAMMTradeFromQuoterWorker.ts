import { SmartRouterTrade } from '@pancakeswap/smart-router'
import { TradeType } from '@pancakeswap/swap-sdk-core'
import { bestTradeHookFactory } from './bestTradeHookFactory'
import { createQuoteProvider } from './createQuoteProvider'
import { createUseWorkerGetBestTrade } from './createUseWorkerGetBestTrade'
import { useCommonPoolsLite } from './useCommonPools'

export const useBestAMMTradeFromQuoterWorker = bestTradeHookFactory<SmartRouterTrade<TradeType>>({
  key: 'useBestAMMTradeFromQuoterWorker',
  useCommonPools: useCommonPoolsLite,
  createQuoteProvider,
  useGetBestTrade: createUseWorkerGetBestTrade(),
  // Since quotes are fetched on chain, which relies on network IO, not calculated offchain, we don't need to further optimize
  quoterOptimization: false,
})
