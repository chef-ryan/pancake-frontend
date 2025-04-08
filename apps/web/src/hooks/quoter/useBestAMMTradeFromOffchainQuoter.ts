import { InfinityRouter } from '@pancakeswap/smart-router'
import { TradeType } from '@pancakeswap/swap-sdk-core'
import { bestTradeHookFactory } from './bestTradeHookFactory'
import { createQuoteProvider } from './createQuoteProvider'
import { createUseWorkerGetBestTradeOffchain } from './createUseWorkerGetBestTradeOffchain'
import { useCommonPoolsOnChain } from './useCommonPools'

export const useBestAMMTradeFromOffchainQuoter = bestTradeHookFactory<
  InfinityRouter.InfinityTradeWithoutGraph<TradeType>
>({
  key: 'useBestAMMTradeFromOffchainQuoter',
  useCommonPools: useCommonPoolsOnChain,
  createQuoteProvider,
  useGetBestTrade: createUseWorkerGetBestTradeOffchain(),
})
