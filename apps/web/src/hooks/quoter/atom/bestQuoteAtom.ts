import { atom, Getter } from 'jotai'
import { atomFamily, unwrap } from 'jotai/utils'
import { QuoteOption } from '../quoter.types'
import { isEqualQuoteQuery } from './PoolHashHelper'
import { bestAMMTradeFromQuoterWorkerAtom } from './bestAMMTradeFromQuoterWorkerAtom'

type Loadable<T> = {
  loading: boolean
  data?: T
  error?: Error
}

export const atomWithLoadable = <T>(asyncFn: (get: Getter) => Promise<T>) => {
  const baseAtom = atom(async (get) => {
    try {
      const result = await asyncFn(get)
      return {
        loading: false,
        data: result,
        error: undefined,
      } as Loadable<T>
    } catch (error: any) {
      let err: Error
      if (!(error instanceof Error)) {
        err = new Error(error.toString())
      } else {
        err = error
      }

      return {
        loading: false,
        data: undefined,
        error: err,
      } as Loadable<T>
    }
  })

  return unwrap(
    baseAtom,
    () =>
      ({
        loading: true,
        data: undefined,
        error: undefined,
      } as Loadable<T>),
  )
}

export const bestQuoteAtom = atomFamily((option: QuoteOption) => {
  return atomWithLoadable(async (get) => {
    return get(bestAMMTradeFromQuoterWorkerAtom(option))
  })
}, isEqualQuoteQuery)
