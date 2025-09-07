import { ApiV3PoolInfoConcentratedItem } from '@pancakeswap/solana-core-sdk'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { SLOW_INTERVAL } from 'config/constants'
import { useMemo } from 'react'

async function fetchSolanaPoolsData(
  poolIds: (string | undefined)[],
): Promise<(ApiV3PoolInfoConcentratedItem | null)[]> {
  const validPoolIds = poolIds.filter(Boolean) as string[]

  if (validPoolIds.length === 0) {
    return poolIds.map(() => null)
  }

  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_SOL_EXPLORE_API_ENDPOINT!
    const searchUrl = '/cached/v1/pools/info/ids'
    const response = await fetch(`${apiBaseUrl}${searchUrl}?ids=${validPoolIds.join(',')}`)

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const responseData = await response.json()
    const poolsData = responseData.data || responseData || []

    const poolDataMap = new Map<string, ApiV3PoolInfoConcentratedItem>()
    poolsData.forEach((pool: ApiV3PoolInfoConcentratedItem) => {
      if (pool && pool.id) {
        poolDataMap.set(pool.id, pool)
      }
    })

    return poolIds.map((poolId) => {
      if (!poolId) {
        return null
      }
      return poolDataMap.get(poolId) || null
    })
  } catch (error) {
    console.error('Error fetching Solana pools data:', error)
    return poolIds.map(() => null)
  }
}

export function useSolanaV3Pools(poolIds: (string | undefined)[]): (ApiV3PoolInfoConcentratedItem | null)[] {
  const poolIdsString = useMemo(() => JSON.stringify(poolIds), [poolIds])

  const { data: poolInfos } = useQuery({
    queryKey: ['solanaV3Pools', poolIdsString],
    queryFn: () => fetchSolanaPoolsData(poolIds),
    enabled: poolIds.some((poolId) => poolId !== undefined),
    placeholderData: keepPreviousData,
    refetchInterval: SLOW_INTERVAL,
  })

  return useMemo(() => {
    if (!poolInfos) {
      return poolIds.map(() => null)
    }

    return poolInfos
  }, [poolIds, poolInfos])
}

export function useSolanaV3Pool(poolId: string | undefined): ApiV3PoolInfoConcentratedItem | null {
  const poolIds = useMemo(() => [poolId], [poolId])

  return useSolanaV3Pools(poolIds)[0]
}
