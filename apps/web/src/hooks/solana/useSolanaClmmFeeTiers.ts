import { useMemo } from 'react'
import { useClmmAmmConfigs } from './useClmmAmmConfigs'

// Returns unique trade fee tiers as percent numbers (e.g. 0.25 for 0.25%)
export const useSolanaClmmFeeTiers = () => {
  const configs = useClmmAmmConfigs()
  return useMemo<number[]>(() => {
    const rates = Object.values(configs).map((c) => c.tradeFeeRate)
    const unique = Array.from(new Set(rates))
    // tradeFeeRate unit is 1e6 == 100%, convert to percent: 2500 -> 0.25
    return unique.map((r) => r / 10000).sort((a, b) => a - b)
  }, [configs])
}
