import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Raydium } from '@pancakeswap/solana-core-sdk'
import { useRaydiumClient } from './useRaydiumClient'

export type SolanaOnchainClmmPoolData = Awaited<ReturnType<InstanceType<typeof Raydium>['clmm']['getPoolInfoFromRpc']>>

export async function getSolanaOnchainClmmPoolInfo(raydium: Raydium, poolId: string) {
  return raydium.clmm.getPoolInfoFromRpc(poolId)
}

export function useSolanaOnchainClmmPoolInfo(poolId?: string) {
  const raydium = useRaydiumClient()

  const { data, isLoading, error } = useQuery<SolanaOnchainClmmPoolData>({
    queryKey: ['solanaOnchainPoolInfo', poolId],
    enabled: Boolean(poolId && raydium),
    queryFn: async () => {
      if (!poolId || !raydium) throw new Error('poolId and raydium client required')
      return getSolanaOnchainClmmPoolInfo(raydium, poolId)
    },
    staleTime: 30_000,
  })

  return useMemo(() => ({ data, isLoading, error }), [data, isLoading, error])
}
