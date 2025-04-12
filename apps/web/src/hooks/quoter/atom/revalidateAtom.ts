import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { QuoteOption } from '../quoter.types'
import { isEqualPoolQuery, isEqualQuoteQuery, PoolQuery } from './PoolHashHelper'

export const quoteRevalidateAtom = atomFamily((_: QuoteOption) => {
  return atom(0)
}, isEqualQuoteQuery)

export const poolVersionAtom = atomFamily((_: PoolQuery) => {
  return atom(0)
}, isEqualPoolQuery)

export const poolRevalidateAtom = atom(null, async (get, set, option: QuoteOption) => {
  const poolQuery: PoolQuery = {
    currencyA: option.amount?.currency,
    currencyB: option.currency || undefined,
    chainId: option.currency?.chainId,
  }

  set(poolVersionAtom(poolQuery), (v) => v + 1)
})
