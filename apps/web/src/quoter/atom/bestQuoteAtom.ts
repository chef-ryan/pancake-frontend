import { TradeType } from '@pancakeswap/swap-sdk-core'
import { getIsWrapping } from 'hooks/useWrapCallback'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { createQuoteQuery } from 'quoter/utils/createQuoteQuery'
import { isBetterQuoteTrade } from 'quoter/utils/getBetterQuote'
import { isEqualQuoteQuery } from 'quoter/utils/PoolHashHelper'
import { InterfaceOrder } from 'views/Swap/utils'
import { QuoteQuery } from '../quoter.types'
import { emptyLoadable, errorLoadable, Loadable, pendingLoadable, valueLoadable } from './atomWithLoadable'
import { bestAMMTradeFromOffchainQuoterAtom } from './bestAMMTradeFromOffchainQuoterAtom'
import { bestAMMTradeFromQuoterWorkerAtom } from './bestAMMTradeFromQuoterWorkerAtom'
import { bestTradeFromApi } from './bestTradeFromAPIAtom'

const bestQuoteWithoutHashAtom = atomFamily((_option: QuoteQuery) => {
  return atom((get) => {
    const option: QuoteQuery = { enabled: true, type: 'quoter', tradeType: TradeType.EXACT_INPUT, ..._option }
    try {
      const isWrapping = getIsWrapping(option.amount?.currency, option.currency || undefined, option.currency?.chainId)
      if (isWrapping || !option.enabled) {
        return emptyLoadable<InterfaceOrder | undefined>()
      }
      if (!option.baseCurrency || !option.currency) {
        return emptyLoadable<InterfaceOrder | undefined>()
      }
      if (option.baseCurrency?.equals(option.currency)) {
        return emptyLoadable<InterfaceOrder | undefined>()
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

      const quotes = [
        // single hoop quote for quick solution
        get(bestAMMTradeFromQuoterWorkerAtom(querySingleHop)),
        // non-infinity-solution
        get(bestAMMTradeFromOffchainQuoterAtom(queryNonInfinity)),
        // infinity-solution ( via routing sdk )
        option.infinitySwap ? get(bestAMMTradeFromOffchainQuoterAtom(queryWithInfinity)) : undefined,

        option.xEnabled ? get(bestTradeFromApi(option)) : undefined,
      ].filter((x) => x) as Loadable<InterfaceOrder>[]
      const anyLoading = quotes.some((x) => x?.loading)

      const best = findBestQuote(...quotes)
      if (!best) {
        if (anyLoading) {
          return pendingLoadable<InterfaceOrder | undefined>()
        }
        const fallback = get(bestAMMTradeFromQuoterWorkerAtom(option))
        return fallback
      }
      const [bestQuote, bestIndex] = best
      if (bestQuote) {
        return valueLoadable(bestQuote as InterfaceOrder | undefined)
      }
      if (anyLoading) {
        return pendingLoadable<InterfaceOrder | undefined>()
      }
      return emptyLoadable<InterfaceOrder | undefined>()
    } catch (ex) {
      // eslint-disable-next-line no-console
      console.warn(`[quote]`, ex)
      return errorLoadable<InterfaceOrder | undefined>(ex)
    }
  })
}, isEqualQuoteQuery)

export const bestQuoteAtom = atomFamily((_option: QuoteQuery) => {
  return atom((get) => {
    const result = get(bestQuoteWithoutHashAtom(_option))
    return { ...result, hash: _option.hash }
  })
}, isEqualQuoteQuery)

function findBestQuote(...args: Loadable<InterfaceOrder>[]): [InterfaceOrder, number] | undefined {
  const fulfilledValues = args.filter((x) => x.data).map((x) => x.data)

  let bestOrder: InterfaceOrder | undefined
  let idx = -1
  for (let i = 0; i < fulfilledValues.length; i++) {
    const order = fulfilledValues[i]
    if (!bestOrder) {
      bestOrder = order
      idx = i
      continue
    }
    if (!order?.trade) continue
    if (isBetterQuoteTrade(bestOrder.trade, order.trade)) {
      bestOrder = order
      idx = i
    }
  }
  return bestOrder ? [bestOrder, idx] : undefined
}
