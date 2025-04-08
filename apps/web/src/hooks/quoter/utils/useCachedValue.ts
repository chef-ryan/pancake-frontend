import { useMemo, useRef } from 'react'

export function useCachedValue<T>(valueFN: () => T, isLocked: boolean, deps?: any[]): T {
  const lockedValue = useRef<T | undefined>(undefined)

  return useMemo(() => {
    const resolvedValue = valueFN()

    if (lockedValue.current === undefined) {
      lockedValue.current = resolvedValue
    }

    lockedValue.current = isLocked ? lockedValue.current : resolvedValue

    return lockedValue.current
  }, [isLocked, ...(deps || [])])
}
