import { PoolInfo } from '@pancakeswap/solana-clmm-sdk'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { solExplorerApiClient } from 'state/info/api/client'
import { normalizeSolanaPoolInfo } from 'utils/normalizeSolanaPoolInfo'

export const useSolanaPoolsByMint = (token0?: string, token1?: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['solana-pools-by-mint', token0, token1],
    enabled: Boolean(token0 && token1 && enabled),
    queryFn: async () => {
      const resp = await solExplorerApiClient.GET('/cached/v1/pools/info/mint', {
        params: {
          query: {
            token0,
            token1,
            poolType: 'concentrated',
            sortType: 'desc',
          },
        },
      })
      return (resp.data?.data ?? []) satisfies PoolInfo[]
    },
  })
}

export const useSolanaPoolByMint = (token0?: string, token1?: string, feeAmount?: number) => {
  const { data: poolsByMint } = useSolanaPoolsByMint(token0, token1)
  return useMemo(() => {
    const pool = poolsByMint?.find((p) => p.config.tradeFeeRate === feeAmount)
    return normalizeSolanaPoolInfo(pool)
  }, [poolsByMint, feeAmount])
}
