/* eslint-disable @typescript-eslint/no-shadow, no-await-in-loop, no-constant-condition, no-console */
import { isInfinitySupported } from '@pancakeswap/infinity-sdk'
import { Currency } from '@pancakeswap/sdk'
import { Pool } from '@pancakeswap/smart-router'
import { useCallback, useMemo } from 'react'

import {
  InfinityBinPoolsHookParams,
  InfinityBinPoolsResult,
  useInfinityBinCandidatePools,
  useInfinityBinCandidatePoolsWithoutBins,
} from './useInfinityBinPools'
import {
  InfinityCLPoolsHookParams,
  InfinityCLPoolsResult,
  useInfinityClCandidatePools,
  useInfinityClCandidatePoolsWithoutTicks,
} from './useInfinityClPools'
import { useStableCandidatePools } from './usePoolsOnChain'
import { useV2CandidatePools } from './useV2Pools'
import {
  useV3CandidatePools,
  useV3CandidatePoolsWithoutTicks,
  useV3PoolsWithTicksOnChain,
  V3PoolsHookParams,
  V3PoolsResult,
} from './useV3Pools'

interface FactoryOptions {
  // use to identify hook
  key: string

  useV3Pools: (currencyA?: Currency, currencyB?: Currency, params?: V3PoolsHookParams) => V3PoolsResult

  useInfinityClPools: (
    currencyA?: Currency,
    currencyB?: Currency,
    params?: InfinityCLPoolsHookParams,
  ) => InfinityCLPoolsResult

  useInfinityBinPools: (
    currencyA?: Currency,
    currencyB?: Currency,
    params?: InfinityBinPoolsHookParams,
  ) => InfinityBinPoolsResult
}

export interface PoolsWithState {
  refresh: () => Promise<unknown>
  pools: Pool[] | undefined
  loading: boolean
  syncing: boolean
  blockNumber?: number
  dataUpdatedAt?: number
}

export interface CommonPoolsParams {
  blockNumber?: number
  allowInconsistentBlock?: boolean
  enabled?: boolean
}

function commonPoolsHookCreator({ useV3Pools, useInfinityClPools, useInfinityBinPools }: FactoryOptions) {
  return function useCommonPools(
    currencyA?: Currency,
    currencyB?: Currency,
    { blockNumber, allowInconsistentBlock = false, enabled = true }: CommonPoolsParams = {},
  ): PoolsWithState {
    const infinityEnabled = useMemo(
      () => (currencyA?.chainId ? isInfinitySupported(currencyA.chainId) : false),
      [currencyA?.chainId],
    )
    const {
      pools: v3Pools,
      loading: v3Loading,
      syncing: v3Syncing,
      blockNumber: v3BlockNumber,
      refresh: v3Refresh,
      dataUpdatedAt: v3PoolsUpdatedAt,
    } = useV3Pools(currencyA, currencyB, { blockNumber, enabled })
    const {
      pools: v2Pools,
      loading: v2Loading,
      syncing: v2Syncing,
      blockNumber: v2BlockNumber,
      refresh: v2Refresh,
      dataUpdatedAt: v2PoolsUpdatedAt,
    } = useV2CandidatePools(currencyA, currencyB, { blockNumber, enabled })
    const {
      pools: stablePools,
      loading: stableLoading,
      syncing: stableSyncing,
      blockNumber: stableBlockNumber,
      refresh: stableRefresh,
      dataUpdatedAt: stablePoolsUpdatedAt,
    } = useStableCandidatePools(currencyA, currencyB, { blockNumber, enabled })

    const {
      pools: infinityClPools,
      loading: infinityClPoolsLoading,
      syncing: infinityClPoolsSyncing,
      refresh: infinityClPoolsRefresh,
      dataUpdatedAt: infinityClPoolsUpdatedAt,
    } = useInfinityClPools(currencyA, currencyB, { blockNumber, enabled: enabled && infinityEnabled })
    const {
      pools: infinityBinPools,
      loading: infinityBinPoolsLoading,
      syncing: infinityBinPoolsSyncing,
      refresh: infinityBinPoolsRefresh,
      dataUpdatedAt: infinityBinPoolsUpdatedAt,
    } = useInfinityBinPools(currencyA, currencyB, { blockNumber, enabled: enabled && infinityEnabled })

    const consistentBlockNumber = useMemo(
      () =>
        v2BlockNumber &&
        stableBlockNumber &&
        v3BlockNumber &&
        v2BlockNumber === stableBlockNumber &&
        stableBlockNumber === v3BlockNumber
          ? v2BlockNumber
          : undefined,
      [v2BlockNumber, v3BlockNumber, stableBlockNumber],
    )
    // FIXME: allow inconsistent block not working as expected
    const poolsData: [Pool[], number] | undefined = useMemo(
      () =>
        (!v2Loading || v2Pools) &&
        (!v3Loading || v3Pools) &&
        (!stableLoading || stablePools) &&
        (!infinityEnabled || !infinityClPoolsLoading || infinityClPools) &&
        (!infinityEnabled || !infinityBinPoolsLoading || infinityBinPools) &&
        (allowInconsistentBlock || !!consistentBlockNumber)
          ? [
              [
                ...(v2Pools || []),
                ...(v3Pools || []),
                ...(stablePools || []),
                ...(infinityClPools || []),
                ...(infinityBinPools || []),
              ],
              max([
                v2PoolsUpdatedAt ?? 0,
                v3PoolsUpdatedAt ?? 0,
                stablePoolsUpdatedAt,
                infinityClPoolsUpdatedAt ?? 0,
                infinityBinPoolsUpdatedAt ?? 0,
              ]),
            ]
          : undefined,
      [
        infinityEnabled,
        infinityBinPools,
        infinityBinPoolsLoading,
        infinityClPools,
        infinityClPoolsLoading,
        v2Loading,
        v2Pools,
        v3Loading,
        v3Pools,
        stableLoading,
        stablePools,
        allowInconsistentBlock,
        consistentBlockNumber,
        v3PoolsUpdatedAt,
        v2PoolsUpdatedAt,
        stablePoolsUpdatedAt,
        infinityClPoolsUpdatedAt,
        infinityBinPoolsUpdatedAt,
      ],
    )

    const refresh = useCallback(async () => {
      return Promise.all([
        v3Refresh(),
        v2Refresh(),
        stableRefresh(),
        infinityBinPoolsRefresh(),
        infinityClPoolsRefresh(),
      ])
    }, [v3Refresh, v2Refresh, stableRefresh, infinityBinPoolsRefresh, infinityClPoolsRefresh])

    const loading =
      v2Loading ||
      v3Loading ||
      stableLoading ||
      (infinityEnabled && (infinityClPoolsLoading || infinityBinPoolsLoading))
    const syncing =
      v2Syncing ||
      v3Syncing ||
      stableSyncing ||
      (infinityEnabled && (infinityClPoolsSyncing || infinityBinPoolsSyncing))
    return {
      refresh,
      pools: poolsData?.[0],
      blockNumber: consistentBlockNumber,
      loading,
      syncing,
      dataUpdatedAt: poolsData?.[1],
    }
  }
}

function max(numbers: number[]): number {
  let maxNum = Number.NEGATIVE_INFINITY
  for (const num of numbers) {
    maxNum = num > maxNum ? num : maxNum
  }
  return maxNum
}

// Get v3 pools data from on chain
export const useCommonPoolsOnChain = commonPoolsHookCreator({
  key: 'useCommonPoolsOnChain',
  useV3Pools: useV3PoolsWithTicksOnChain,
  useInfinityBinPools: useInfinityBinCandidatePools,
  useInfinityClPools: useInfinityClCandidatePools,
})

export const useCommonPools = commonPoolsHookCreator({
  key: 'useCommonPools',
  useV3Pools: useV3CandidatePools,
  useInfinityClPools: useInfinityClCandidatePools,
  useInfinityBinPools: useInfinityBinCandidatePools,
})

// In lite version, we don't query ticks data from subgraph
export const useCommonPoolsLite = commonPoolsHookCreator({
  key: 'useCommonPoolsLite',
  useV3Pools: useV3CandidatePoolsWithoutTicks,
  useInfinityClPools: useInfinityClCandidatePoolsWithoutTicks,
  useInfinityBinPools: useInfinityBinCandidatePoolsWithoutBins,
})
