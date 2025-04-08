import { parseAMMPriceResponse } from '@pancakeswap/price-api-sdk'
import { InfinityRouter, SmartRouter } from '@pancakeswap/smart-router'
import { TradeType } from '@pancakeswap/swap-sdk-core'
import { QUOTING_API } from 'config/constants/endpoints'
import { bestTradeHookFactory } from './bestTradeHookFactory'
import { createQuoteProvider } from './createQuoteProvider'
import { createSimpleUseGetBestTradeHook } from './createSimpleUseGetBestTradeHook'
import { useCommonPoolsLite } from './useCommonPools'

export const useBestAMMTradeFromQuoterApi = bestTradeHookFactory<InfinityRouter.InfinityTradeWithoutGraph<TradeType>>({
  key: 'useBestAMMTradeFromPriceAPI',
  useCommonPools: useCommonPoolsLite,
  createQuoteProvider,
  useGetBestTrade: createSimpleUseGetBestTradeHook(
    async (amount, currency, tradeType, { maxHops, maxSplits, allowedPoolTypes, signal }) => {
      const serverRes = await fetch(`${QUOTING_API}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal,
        body: JSON.stringify({
          chainId: currency.chainId,
          currency: SmartRouter.Transformer.serializeCurrency(currency),
          tradeType,
          amount: {
            currency: SmartRouter.Transformer.serializeCurrency(amount.currency),
            value: amount.quotient.toString(),
          },
          maxHops,
          maxSplits,
          poolTypes: allowedPoolTypes,
        }),
      })
      const serializedRes = await serverRes.json()
      return parseAMMPriceResponse(currency.chainId, serializedRes)
    },
  ),
  // Since quotes are fetched on chain, which relies on network IO, not calculated offchain, we don't need to further optimize
  quoterOptimization: false,
})
