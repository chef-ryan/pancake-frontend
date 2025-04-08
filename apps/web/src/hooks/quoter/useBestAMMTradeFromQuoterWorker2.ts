import { ChainId } from '@pancakeswap/chains'
import { BATCH_MULTICALL_CONFIGS, SmartRouter, SmartRouterTrade } from '@pancakeswap/smart-router'
import { TradeType } from '@pancakeswap/swap-sdk-core'
import { createViemPublicClientGetter } from 'utils/viem'
import { bestTradeHookFactory } from './bestTradeHookFactory'
import { createUseWorkerGetBestTrade } from './createUseWorkerGetBestTrade'
import { CreateQuoteProviderParams } from './quoter.types'
import { useCommonPoolsLite } from './useCommonPools'

export const useBestAMMTradeFromQuoterWorker2 = bestTradeHookFactory<SmartRouterTrade<TradeType>>({
  key: 'useBestAMMTradeFromQuoterWorker2',
  useCommonPools: useCommonPoolsLite,
  createQuoteProvider: createQuoteProvider2,
  useGetBestTrade: createUseWorkerGetBestTrade(),
  // Since quotes are fetched on chain, which relies on network IO, not calculated offchain, we don't need to further optimize
  quoterOptimization: false,
})

function createQuoteProvider2({ gasLimit, signal }: CreateQuoteProviderParams) {
  const onChainProvider = createViemPublicClientGetter({ transportSignal: signal })
  return SmartRouter.createQuoteProvider({
    onChainProvider,
    gasLimit,
    multicallConfigs: {
      ...BATCH_MULTICALL_CONFIGS,
      [ChainId.BSC]: {
        ...BATCH_MULTICALL_CONFIGS[ChainId.BSC],
        defaultConfig: {
          gasLimitPerCall: 1_000_000,
        },
      },
    },
  })
}
