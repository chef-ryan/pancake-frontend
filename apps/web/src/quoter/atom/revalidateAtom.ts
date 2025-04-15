import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { QuoteQuery } from '../quoter.types'
import { isEqualPoolQuery, isEqualQuoteQuery, PoolQuery } from '../utils/PoolHashHelper'

export const quoteRevalidateAtom = atomFamily((_: QuoteQuery) => {
  return atom(0)
}, isEqualQuoteQuery)

export const poolVersionAtom = atomFamily((_: PoolQuery) => {
  return atom(0)
}, isEqualPoolQuery)

export const poolRevalidateAtom = atom(null, async (get, set, option: QuoteQuery) => {
  const poolQuery: PoolQuery = {
    currencyA: option.amount?.currency,
    currencyB: option.currency || undefined,
    chainId: option.currency?.chainId,
    infinity: option.infinitySwap,
    v2Pools: Boolean(option.v2Swap),
    v3Pools: Boolean(option.v3Swap),
  }

  set(poolVersionAtom(poolQuery), (v) => v + 1)
})
