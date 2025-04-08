import { InfinityClPool, InfinityRouter } from '@pancakeswap/smart-router'
import { Currency, getCurrencyAddress, sortCurrencies } from '@pancakeswap/swap-sdk-core'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { POOLS_FAST_REVALIDATE } from 'config/pools'
import { getViemClients } from 'utils/viem'

export type InfinityCLPoolsHookParams = {
  // Used for caching
  key?: string
  blockNumber?: number
  enabled?: boolean
}

export type InfinityCLPoolsResult = {
  refresh: () => Promise<unknown>
  pools?: InfinityClPool[] | undefined
  loading: boolean
  syncing: boolean
  blockNumber?: number
  error: Error | null
  dataUpdatedAt?: number
}

export function useInfinityClCandidatePools(
  currencyA?: Currency,
  currencyB?: Currency,
  options?: InfinityCLPoolsHookParams,
): InfinityCLPoolsResult {
  const key = useMemo(() => {
    if (
      !currencyA ||
      !currencyB ||
      currencyA.chainId !== currencyB.chainId ||
      currencyA.wrapped.equals(currencyB.wrapped)
    ) {
      return ''
    }
    const [currency0, currency1] = sortCurrencies([currencyA, currencyB])
    return [
      currency0.isNative,
      getCurrencyAddress(currency0),
      currency1.isNative,
      getCurrencyAddress(currency1),
      currency0.chainId,
    ].join('_')
  }, [currencyA, currencyB])

  const refetchInterval = useMemo(() => {
    if (!currencyA?.chainId) {
      return 0
    }
    return POOLS_FAST_REVALIDATE[currencyA.chainId] || 0
  }, [currencyA?.chainId])

  const { data, refetch, isPending, isFetching, error } = useQuery({
    queryKey: ['infinity_cl_candidate_pools', key],
    queryFn: async () => {
      const pools = await InfinityRouter.getInfinityClCandidatePools({
        currencyA,
        currencyB,
        clientProvider: getViemClients,
      })
      return {
        key,
        pools,
        blockNumber: options?.blockNumber,
      }
    },
    retry: 2,
    staleTime: refetchInterval,
    refetchInterval,
    refetchOnWindowFocus: false,
    enabled: Boolean(currencyA && currencyB && key && options?.enabled),
  })

  return {
    refresh: refetch,
    pools: data?.pools,
    loading: isPending,
    syncing: isFetching,
    blockNumber: data?.blockNumber,
    error,
  }
}

export function useInfinityClCandidatePoolsWithoutTicks(
  currencyA?: Currency,
  currencyB?: Currency,
  options?: InfinityCLPoolsHookParams,
) {
  const key = useMemo(() => {
    if (
      !currencyA ||
      !currencyB ||
      currencyA.chainId !== currencyB.chainId ||
      currencyA.wrapped.equals(currencyB.wrapped)
    ) {
      return ''
    }
    const [currency0, currency1] = sortCurrencies([currencyA, currencyB])
    return [
      currency0.isNative,
      getCurrencyAddress(currency0),
      currency1.isNative,
      getCurrencyAddress(currency1),
      currency0.chainId,
    ].join('_')
  }, [currencyA, currencyB])

  const refetchInterval = useMemo(() => {
    if (!currencyA?.chainId) {
      return 0
    }
    return POOLS_FAST_REVALIDATE[currencyA.chainId] || 0
  }, [currencyA?.chainId])

  const { data, refetch, isPending, isFetching, error } = useQuery({
    queryKey: ['infinity_cl_candidate_pools_without_ticks', key],
    queryFn: async () => {
      const pools = await InfinityRouter.getInfinityClCandidatePoolsWithoutTicks({
        currencyA,
        currencyB,
        clientProvider: getViemClients,
      })
      return {
        key,
        pools,
        blockNumber: options?.blockNumber,
      }
    },
    retry: 2,
    staleTime: refetchInterval,
    refetchInterval,
    refetchOnWindowFocus: false,
    enabled: Boolean(currencyA && currencyB && key && options?.enabled),
  })

  return {
    refresh: refetch,
    pools: data?.pools,
    loading: isPending,
    syncing: isFetching,
    blockNumber: data?.blockNumber,
    key: data?.key,
    error,
  }
}
