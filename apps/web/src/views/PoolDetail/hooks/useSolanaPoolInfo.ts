import { NonEVMChainId } from '@pancakeswap/chains'
import { useQuery } from '@tanstack/react-query'
import { QUERY_SETTINGS_IMMUTABLE } from 'config/constants'
import { useMemo } from 'react'
import { SolV3PoolInfo } from 'state/farmsV4/state/type'
import { solExplorerApiClient } from 'state/info/api/client'
import { normalizeSolanaPoolInfo } from 'utils/normalizeSolanaPoolInfo'

const fetchSolanaPoolInfo = async (poolId: string, signal?: AbortSignal) => {
  try {
    const resp = await solExplorerApiClient.GET('/cached/v1/pools/info/ids', {
      signal,
      params: {
        query: {
          ids: poolId,
        },
      },
    })
    return resp.data?.data?.[0] ?? null
  } catch (error) {
    console.error('Error fetching Solana pool info:', error)
    throw error
  }
}

export const useSolanaPoolInfo = (
  poolId: string | undefined,
  chainId: number | undefined,
): {
  data: SolV3PoolInfo | null
  isLoading: boolean
  error: Error | null
} => {
  const isSolana = chainId === NonEVMChainId.SOLANA

  const {
    data: solanaPoolInfo,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['solanaPoolInfo', poolId, chainId],
    queryFn: () => {
      if (!poolId || !isSolana) {
        return null
      }
      return fetchSolanaPoolInfo(poolId)
    },
    enabled: !!poolId && isSolana,
    retry: 3,
    retryDelay: 1000,
    ...QUERY_SETTINGS_IMMUTABLE,
  })

  // Convert Solana pool data to match EVM pool info structure
  const convertedPoolInfo = useMemo(() => {
    if (!solanaPoolInfo || !isSolana) return null
    return normalizeSolanaPoolInfo(solanaPoolInfo)
  }, [solanaPoolInfo, isSolana])

  return {
    data: convertedPoolInfo,
    isLoading,
    error,
  }
}
