import { SmartRouterTrade } from '@pancakeswap/smart-router'
import { TradeType } from '@pancakeswap/swap-sdk-core'
import { getIsWrapping } from 'hooks/useWrapCallback'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { createQuoteQuery } from '../createQuoteQuery'
import { getBetterQuoteTrade } from '../getBetterQuote'
import { QuoteOption, QuoteTrade } from '../quoter.types'
import { isEqualQuoteQuery } from './PoolHashHelper'
import { atomWithLoadable } from './atomWithLoadable'
import { bestAMMTradeFromOffchainQuoterAtom } from './bestAMMTradeFromOffchainQuoterAtom'
import { bestAMMTradeFromQuoterWorkerAtom } from './bestAMMTradeFromQuoterWorkerAtom'
import { bestTradeFromApi } from './bestTradeFromAPIAtom'

const bestQuoteWithoutHashAtom = atomFamily((_option: QuoteOption) => {
  return atomWithLoadable(async (get) => {
    const option: QuoteOption = { enabled: true, type: 'quoter', tradeType: TradeType.EXACT_INPUT, ..._option }
    try {
      const isWrapping = getIsWrapping(option.amount?.currency, option.currency || undefined, option.currency?.chainId)
      if (isWrapping || !option.enabled) {
        return undefined
      }
      if (!option.baseCurrency || !option.currency) {
        return undefined
      }
      if (option.baseCurrency?.equals(option.currency)) {
        return undefined
      }

      const querySingleHop = createQuoteQuery({
        ...option,
        maxHops: 1,
        maxSplits: 0,
        enabled: true,
        infinitySwap: false,
      })

      const queryNonInfinity = createQuoteQuery({
        ...option,
        infinitySwap: false,
      })

      const queryWithInfinity = option

      const quotes = await Promise.allSettled([
        // single hoop quote for quick solution
        get(bestAMMTradeFromQuoterWorkerAtom(querySingleHop)),
        // non-infinity-solution
        get(bestAMMTradeFromOffchainQuoterAtom(queryNonInfinity)),
        // infinity-solution ( via routing sdk )
        option.infinitySwap ? get(bestAMMTradeFromOffchainQuoterAtom(queryWithInfinity)) : undefined,

        get(bestTradeFromApi(option)),
      ])
      const best = findBestQuote(...quotes)
      if (!best) {
        // eslint-disable-next-line no-console
        const fallback = await get(bestAMMTradeFromQuoterWorkerAtom(option))
        return fallback
      }
      const [bestQuote, bestIndex] = best
      // eslint-disable-next-line no-console
      return bestQuote as SmartRouterTrade<TradeType> | undefined
    } catch (ex) {
      // eslint-disable-next-line no-console
      console.warn(`[quote]`, ex)
      throw ex
    }
  })
}, isEqualQuoteQuery)

export const bestQuoteAtom = atomFamily((_option: QuoteOption) => {
  return atom(async (get) => {
    const result = get(bestQuoteWithoutHashAtom(_option))
    return { ...result, hash: _option.hash }
  })
}, isEqualQuoteQuery)

function findBestQuote(...args: PromiseSettledResult<QuoteTrade | undefined>[]): [QuoteTrade, number] | undefined {
  const fulfilledValues = args.filter((x) => x.status === 'fulfilled').map((x) => x.value)

  const best = fulfilledValues.reduce(
    (acc, current, index) => {
      if (!current) return acc
      if (!acc.trade || getBetterQuoteTrade(acc.trade, current) === current) {
        return { trade: current, index }
      }
      return acc
    },
    { trade: undefined as QuoteTrade | undefined, index: -1 },
  )

  return best.trade ? [best.trade, best.index] : undefined
}
