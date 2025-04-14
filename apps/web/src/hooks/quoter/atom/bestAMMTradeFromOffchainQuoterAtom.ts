import { InfinityRouter, SmartRouter } from '@pancakeswap/smart-router'
import { TradeType } from '@pancakeswap/swap-sdk-core'
import { globalWorkerAtom } from 'hooks/useWorker'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { InfinityGetBestTradeReturnType, NoValidRouteError, QuoteOption } from '../quoter.types'
import { getVerifiedTrade } from '../useTradeVerifiedByQuoter'
import { gasPriceWeiAtom } from './gasPriceAtom'
import { isEqualQuoteQuery } from './PoolHashHelper'
import { commonPoolsAtom } from './poolsAtom'
import { quoteRevalidateAtom } from './revalidateAtom'

export const bestAMMTradeFromOffchainQuoterAtom = atomFamily((option: QuoteOption) => {
  const { amount, currency, tradeType, maxSplits } = option
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
          commonPoolsAtom({
            currencyA: amount.currency,
            currencyB: currency,
            chainId: currency.chainId,
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
      return (verifiedTrade || undefined) as InfinityGetBestTradeReturnType | undefined
    } catch (ex) {
      console.warn(`[quote]`, ex)
      throw new NoValidRouteError()
    }
  })
}, isEqualQuoteQuery)
