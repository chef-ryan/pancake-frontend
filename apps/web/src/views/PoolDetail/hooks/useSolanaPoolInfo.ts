import { NonEVMChainId } from '@pancakeswap/chains'
import { Protocol } from '@pancakeswap/farms'
import { isSolWSol, SOL } from '@pancakeswap/sdk'
import { SPLToken } from '@pancakeswap/swap-sdk-core'
import { useQuery } from '@tanstack/react-query'
import { QUERY_SETTINGS_IMMUTABLE } from 'config/constants'
import { useMemo } from 'react'
import { SolV3PoolInfo } from 'state/farmsV4/state/type'
import { solExplorerApiClient } from 'state/info/api/client'

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
    const token0 = new SPLToken({ ...solanaPoolInfo.mintA, chainId: NonEVMChainId.SOLANA })
    const token1 = new SPLToken({ ...solanaPoolInfo.mintB, chainId: NonEVMChainId.SOLANA })

    return {
      chainId: NonEVMChainId.SOLANA,
      lpAddress: solanaPoolInfo.id as `0x${string}`,
      poolId: solanaPoolInfo.id,
      protocol: Protocol.V3 as const,
      token0: isSolWSol(token0) ? SOL : token0,
      token1: isSolWSol(token1) ? SOL : token1,
      token0Price: String(solanaPoolInfo.price) as `${number}`,
      token1Price: String(1 / solanaPoolInfo.price) as `${number}`,
      tvlToken0: String(solanaPoolInfo.mintAmountA) as `${number}`,
      tvlToken1: String(solanaPoolInfo.mintAmountB) as `${number}`,
      tvlUsd: String(solanaPoolInfo.tvl) as `${number}`,
      vol24hUsd: String(solanaPoolInfo.day.volume) as `${number}`,
      vol48hUsd: String(solanaPoolInfo.day.volume * 2) as `${number}`, // Approximate
      vol7dUsd: String(solanaPoolInfo.week.volume) as `${number}`,
      fee24hUsd: String(solanaPoolInfo.day.volumeFee) as `${number}`,
      lpFee24hUsd: String(solanaPoolInfo.day.volumeFee) as `${number}`,
      lpApr: String(solanaPoolInfo.day.apr) as `${number}`,
      feeTier: Math.round(solanaPoolInfo.feeRate * 1e6), // Convert to basis points
      feeTierBase: 1e6, // Base for percentage calculations
      isFarming: false,
      isDynamicFee: false,
      solanaData: solanaPoolInfo,
    }
  }, [solanaPoolInfo, isSolana])

  return {
    data: convertedPoolInfo,
    isLoading,
    error,
  }
}
