import localForage from 'localforage'

export interface StorageInterface {
  getItem: <T>(key: string, defaultValue: T | null) => Promise<T | null>
  setItem: (key: string, value: any) => Promise<void>
  removeItem: (key: string) => Promise<void>
}

const memoryStorage = new Map<string, any>()

const memoryStorageInterface: StorageInterface = {
  getItem: async <T>(key: string, defaultValue: T | null): Promise<T | null> => {
    const value = memoryStorage.get(key)
    return value !== undefined ? (value as T) : defaultValue
  },
  setItem: async (key: string, value: any): Promise<void> => {
    memoryStorage.set(key, value)
  },
  removeItem: async (key: string): Promise<void> => {
    memoryStorage.delete(key)
  },
}

export function IndexedDBStorage(storeName: string, dbName: string): StorageInterface {
  if (typeof window !== 'undefined') {
    const db = localForage.createInstance({
      name: dbName,
      storeName,
    })
    return {
      getItem: async <T>(key: string, defaultValue: T | null) => {
        const value = await db.getItem<T>(key)
        return value !== null && value !== undefined ? value : defaultValue
      },
      setItem: async (k: string, v: any) => {
        await db.setItem(k, v)
      },
      removeItem: (key: string) => db.removeItem(key),
    }
  }
  return memoryStorageInterface
}
