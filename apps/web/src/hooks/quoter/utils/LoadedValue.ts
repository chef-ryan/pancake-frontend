export type LoadedValue<T> =
  | ({
      isLoading: boolean
      error: Error | undefined
      syncing?: boolean
      isStale?: boolean
      refresh?: (...args: any[]) => Promise<void>
    } & T)
  | undefined

export function createLoadedValue<T>(
  value: T | undefined,
  isLoading: boolean,
  error: Error | undefined | null,
): LoadedValue<T> {
  if (!value) {
    return undefined
  }
  return { isLoading, error: error === null ? undefined : error, ...value }
}
