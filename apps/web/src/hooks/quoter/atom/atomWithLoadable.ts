import { atom, Getter } from 'jotai'
import { unwrap } from 'jotai/utils'

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
      return {
        loading: false,
        data: undefined,
        error,
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
