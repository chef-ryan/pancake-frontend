import { useMemo } from 'react'
import { useClmmAmmConfigs } from './useClmmAmmConfigs'

// Returns unique trade fee tiers as percent numbers (e.g. 0.25 for 0.25%)
export const useSolanaClmmFeeTiers = () => {
  const configs = useClmmAmmConfigs()
  return useMemo<number[]>(() => {
    const rates = Object.values(configs).map((c) => c.tradeFeeRate)
    const unique = Array.from(new Set(rates))
    return unique.sort((a, b) => a - b)
  }, [configs])
}
