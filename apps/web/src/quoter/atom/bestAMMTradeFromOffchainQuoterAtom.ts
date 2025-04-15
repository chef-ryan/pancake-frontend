import { OrderType } from '@pancakeswap/price-api-sdk'
import { InfinityRouter, SmartRouter } from '@pancakeswap/smart-router'
import { TradeType } from '@pancakeswap/swap-sdk-core'
import { globalWorkerAtom } from 'hooks/useWorker'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { gasPriceWeiAtom } from 'quoter/utils/gasPriceAtom'
import { getVerifiedTrade } from 'quoter/utils/getVerifiedTrade'
import { isEqualQuoteQuery } from 'quoter/utils/PoolHashHelper'
import { InterfaceOrder } from 'views/Swap/utils'
import { InfinityGetBestTradeReturnType, NoValidRouteError, QuoteQuery } from '../quoter.types'
import { commonPoolsOnChainAtom } from './poolsAtom'
import { quoteRevalidateAtom } from './revalidateAtom'

export const bestAMMTradeFromOffchainQuoterAtom = atomFamily((option: QuoteQuery) => {
  const { amount, currency, tradeType, maxSplits, v2Swap, v3Swap, infinitySwap } = option
  return atom(async (get) => {
    get(quoteRevalidateAtom(option))

    if (!amount || !amount.currency || !currency) {
      return undefined
    }

    const worker = get(globalWorkerAtom)

    if (!worker) {
      throw new Error('Quote worker not initialized')
    }

    try {
      const [candidatePools, gasPriceWei] = await Promise.all([
        get(
          commonPoolsOnChainAtom({
            currencyA: amount.currency,
            currencyB: currency,
            chainId: currency.chainId,
            infinity: infinitySwap,
            v2Pools: Boolean(v2Swap),
            v3Pools: Boolean(v3Swap),
          }),
        ),
        get(gasPriceWeiAtom(currency?.chainId)),
      ])
      const result = await worker.getBestTradeOffchain({
        chainId: currency.chainId,
        currency: SmartRouter.Transformer.serializeCurrency(currency),
        tradeType: tradeType || TradeType.EXACT_INPUT,
        amount: {
          currency: SmartRouter.Transformer.serializeCurrency(amount.currency),
          value: amount.quotient.toString(),
        },
        gasPriceWei: gasPriceWei?.toString() || '',
        maxHops: option.maxHops,
        maxSplits,
        candidatePools: candidatePools.map(SmartRouter.Transformer.serializePool),
      })
      const trade = InfinityRouter.Transformer.parseTrade(currency.chainId, result) ?? null
      const verifiedTrade = await getVerifiedTrade(trade)
      if (verifiedTrade) {
        verifiedTrade.quoteQueryHash = option.hash
      }
      return {
        type: OrderType.PCS_CLASSIC,
        trade: (verifiedTrade || undefined) as InfinityGetBestTradeReturnType | undefined,
      } as InterfaceOrder
    } catch (ex) {
      console.warn(`[quote]`, ex)
      throw new NoValidRouteError()
    }
  })
}, isEqualQuoteQuery)
