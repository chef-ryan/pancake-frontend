import { AsyncStorage } from 'jotai/vanilla/utils/atomWithStorage'
import localForage from 'localforage'

export interface StorageInterface {
  getItem: <T>(key: string, defaultValue: T | null) => Promise<T | null>
  setItem: (key: string, value: any) => Promise<void>
  removeItem: (key: string) => Promise<void>
}

function noop() {}

const noopStorage: AsyncStorage<any> = {
  getItem: () => Promise.resolve(noop()),
  setItem: () => Promise.resolve(noop()),
  removeItem: () => Promise.resolve(noop()),
}

export function IndexedDBStorage<Value>(dbName: string, storeName: string): AsyncStorage<Value> {
  if (typeof window !== 'undefined') {
    const db = localForage.createInstance({
      name: dbName,
      storeName,
    })
    return {
      getItem: async (key: string, initialValue: Value) => {
        const value = await db.getItem(key)
        if (value) {
          return value as Value
        }
        return initialValue
      },
      setItem: async (k: string, v: any) => {
        await db.setItem(k, v)
      },
      removeItem: db.removeItem,
    }
  }
  return noopStorage as AsyncStorage<Value>
}
