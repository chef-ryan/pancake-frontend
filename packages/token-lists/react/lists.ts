import { atom, useAtom, useAtomValue } from 'jotai'
import { atomWithStorage, loadable } from 'jotai/utils'
import { type AsyncStorage } from 'jotai/vanilla/utils/atomWithStorage'
import localForage from 'localforage'
import debounce from 'lodash/debounce'
import { TokenInfo } from '../dist'
import { ListsState } from './reducer'

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}

const noopStorage: AsyncStorage<any> = {
  getItem: () => Promise.resolve(noop()),
  setItem: () => Promise.resolve(noop()),
  removeItem: () => Promise.resolve(noop()),
}

// eslint-disable-next-line symbol-description
const EMPTY = Symbol()

export const createListsAtom = (storeName: string, reducer: any, initialState: any) => {
  // A cache for get tokens
  const map: TokenMap = {}

  const rebuildTokenMap = debounce((state: ListsState) => {
    Object.keys(map).forEach((chainId) => delete map[Number(chainId)])
    Object.values(state.byUrl).forEach(({ current }) => {
      current?.tokens.forEach((token) => {
        if (!map[token.chainId]) {
          map[token.chainId] = {}
        }
        const chainMap = map[token.chainId]
        chainMap[token.address.toLowerCase()] = { token }
      })
    })
  }, 300)

  /**
   * Persist you redux state using IndexedDB
   * @param {string} dbName - IndexedDB database name
   */
  function IndexedDBStorage<Value>(dbName: string): AsyncStorage<Value> {
    if (typeof window !== 'undefined') {
      const db = localForage.createInstance({
        name: dbName,
        storeName,
      })
      return {
        getItem: async (key: string) => {
          const value = await db.getItem(key)
          if (value) {
            return value
          }
          return initialState
        },
        setItem: async (k: string, v: any) => {
          if (v === EMPTY) return
          await db.setItem(k, v)
        },
        removeItem: db.removeItem,
      }
    }
    return noopStorage
  }

  const listsStorageAtom = atomWithStorage<ListsState | typeof EMPTY>('lists', EMPTY, IndexedDBStorage('lists'))

  const defaultStateAtom = atom<ListsState, any, void>(
    (get) => {
      const value = get(loadable(listsStorageAtom))
      if (value.state === 'hasData' && value.data !== EMPTY) {
        return value.data
      }
      return initialState
    },
    async (get, set, action) => {
      const oldState = get(defaultStateAtom)
      const newState = reducer(oldState, action)
      rebuildTokenMap(newState)
      set(listsStorageAtom, newState)
    },
  )

  const isReadyAtom = loadable(listsStorageAtom)

  function useListState() {
    return useAtom(defaultStateAtom)
  }

  function useListStateReady() {
    const value = useAtomValue(isReadyAtom)
    return value.state === 'hasData' && value.data !== EMPTY
  }

  function getToken(chainId: number, tokenAddress: string) {
    const token = map[chainId]?.[tokenAddress.toLowerCase()]?.token
    if (token) {
      return token
    }
    return undefined
  }

  return {
    listsAtom: defaultStateAtom,
    useListStateReady,
    useListState,
    getToken,
  }
}

interface TokenMap {
  [chainId: number]: {
    [tokenAddress: string]: {
      token: TokenInfo
    }
  }
}
