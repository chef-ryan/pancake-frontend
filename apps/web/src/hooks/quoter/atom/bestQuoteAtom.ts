import { SmartRouterTrade } from '@pancakeswap/smart-router'
import { TradeType } from '@pancakeswap/swap-sdk-core'
import { getIsWrapping } from 'hooks/useWrapCallback'
import { atomFamily } from 'jotai/utils'
import { getBetterQuoteTrade } from '../getBetterQuote'
import { QuoteOption, QuoteTrade } from '../quoter.types'
import { isEqualQuoteQuery } from './PoolHashHelper'
import { atomWithLoadable } from './atomWithLoadable'
import { bestAMMTradeFromOffchainQuoterAtom } from './bestAMMTradeFromOffchainQuoterAtom'
import { bestAMMTradeFromQuoterWorkerAtom } from './bestAMMTradeFromQuoterWorkerAtom'
import { bestTradeFromApi } from './bestTradeFromAPIAtom'

export const bestQuoteAtom = atomFamily((_option: QuoteOption) => {
  return atomWithLoadable(async (get) => {
    const option: QuoteOption = { enabled: true, type: 'quoter', ..._option }
    try {
      const isWrapping = getIsWrapping(option.amount?.currency, option.currency || undefined, option.currency?.chainId)
      if (isWrapping || !option.enabled) {
        return undefined
      }

      const quotes = await Promise.allSettled([
        get(
          bestAMMTradeFromQuoterWorkerAtom({
            ...option,
            maxHops: 1,
            maxSplits: 0,
            enabled: true,
          }),
        ),
        get(bestAMMTradeFromOffchainQuoterAtom(option)),
        get(bestTradeFromApi(option)),
      ])
      const best = findBestQuote(...quotes)
      if (!best) {
        // eslint-disable-next-line no-console
        console.log(`[quote] quote fallback`)
        const fallback = await get(bestAMMTradeFromQuoterWorkerAtom(option))
        return fallback
      }
      const [bestQuote, bestIndex] = best
      // eslint-disable-next-line no-console
      console.log(`[quote] quote through index=`, bestIndex)
      return bestQuote as SmartRouterTrade<TradeType> | undefined
    } catch (ex) {
      // eslint-disable-next-line no-console
      console.warn(`[quote]`, ex)
      throw ex
    }
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
