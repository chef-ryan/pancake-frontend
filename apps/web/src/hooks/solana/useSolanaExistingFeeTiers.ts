import { useQuery } from '@tanstack/react-query'
import { solExplorerApiClient } from 'state/info/api/client'

// Returns a Set of existing fee tiers (as percent numbers, e.g., 0.25) for the given token pair
export const useSolanaExistingFeeTiers = (token0?: string, token1?: string, enabled?: boolean) => {
  return useQuery<Set<number>>({
    queryKey: ['solana-pools-by-mint', token0, token1],
    enabled: Boolean(enabled && token0 && token1),
    queryFn: async () => {
      const resp = await solExplorerApiClient.GET('/cached/v1/pools/info/mint', {
        params: {
          query: {
            token0,
            token1,
            poolType: 'concentrated',
            pageSize: 5000,
            sortType: 'desc',
            page: 1,
          },
        },
      })
      const pools = (resp.data as any)?.data as
        | Array<{
            config?: { tradeFeeRate?: number }
            feeRate?: number
          }>
        | undefined
      if (!pools?.length) return new Set<number>()
      const tiers = pools
        .map((p) => p?.config?.tradeFeeRate ?? p?.feeRate)
        .filter((v): v is number => typeof v === 'number' && !Number.isNaN(v))
        .map((v) => v / 10000)
      return new Set(tiers)
    },
  })
}
