import { Protocol } from '@pancakeswap/farms'
import { InfinityRouter, SmartRouter, V3Pool } from '@pancakeswap/smart-router'
import { cacheByLRU } from '@pancakeswap/utils/cacheByLRU'
import { Tick } from '@pancakeswap/v3-sdk'
import { getPoolTicks } from 'hooks/useAllTicksQuery'
import { v2Clients, v3Clients } from 'utils/graphql'
import { createViemPublicClientGetter, getViemClients } from 'utils/viem'
import { PoolHashHelper, PoolQuery } from './PoolHashHelper'

function getCacheKey(args: [PoolQuery]) {
  const hash = PoolHashHelper.hashPoolQuery(args[0])
  return hash
}

export const getV2CandidatePools = cacheByLRU(
  async (query: PoolQuery) => {
    const { currencyA, currencyB } = query
    if (!query.v2Pools) {
      return []
    }
    const pools = await SmartRouter.getV2CandidatePools({
      currencyA,
      currencyB,
      v2SubgraphProvider: ({ chainId }) => (chainId ? v2Clients[chainId] : undefined),
      v3SubgraphProvider: ({ chainId }) => (chainId ? v3Clients[chainId] : undefined),
      onChainProvider: getViemClients,
    })
    return pools
  },
  {
    ttl: 1000,
    key: getCacheKey,
  },
)

export const getV3CandidatePools = cacheByLRU(
  async (options: PoolQuery) => {
    if (!options.v3Pools) {
      return []
    }
    const pools = await getV3CandidatePoolsWithoutTicks(options)
    return fillV3Ticks(pools)
  },
  {
    ttl: 1000,
    key: getCacheKey,
  },
)

export const getV3CandidatePoolsWithoutTicks = cacheByLRU(
  async (options: PoolQuery) => {
    if (!options.v3Pools) {
      return [] as V3Pool[]
    }

    const { currencyA, currencyB } = options
    return SmartRouter.getV3CandidatePools({
      currencyA,
      currencyB,
      subgraphProvider: ({ chainId }) => (chainId ? v3Clients[chainId] : undefined),
      onChainProvider: getViemClients,
      blockNumber: options?.options?.blockNumber,
    })
  },
  {
    ttl: 1000,
    key: getCacheKey,
  },
)

export const getV3PoolsWithTicksOnChain = cacheByLRU(
  async (query: PoolQuery) => {
    if (!query.v3Pools) {
      return []
    }
    const clientProvider = createViemPublicClientGetter()
    const res = await InfinityRouter.getV3CandidatePools({
      currencyA: query.currencyA,
      currencyB: query.currencyB,
      clientProvider,
      gasLimit: query.options?.gasLimit,
    })
    return res
  },
  {
    ttl: 1000,
    key: getCacheKey,
  },
)

const fillV3Ticks = async (pools: V3Pool[]) => {
  const poolTicks = await Promise.all(
    pools.map(async (pool) => {
      const data = await getPoolTicks({
        chainId: pool.token0.chainId,
        poolAddress: SmartRouter.getPoolAddress(pool),
        protocol: Protocol.V3,
      })
      return data.map(
        ({ tick, liquidityNet, liquidityGross }) => new Tick({ index: Number(tick), liquidityNet, liquidityGross }),
      )
    }),
  )
  return pools?.map((pool, i) => ({
    ...pool,
    ticks: poolTicks[i],
  }))
}

export const getInfinityBinCandidatePools = cacheByLRU(
  async (query: PoolQuery) => {
    if (!query.infinity) {
      return []
    }
    const pools = await InfinityRouter.getInfinityBinCandidatePools({
      currencyA: query.currencyA,
      currencyB: query.currencyB,
      clientProvider: getViemClients,
    })
    return pools
  },
  {
    ttl: 1000,
    key: getCacheKey,
  },
)

export const getInfinityBinCandidatePoolsWithoutBins = cacheByLRU(
  async (query: PoolQuery) => {
    if (!query.infinity) {
      return []
    }
    const pools = await InfinityRouter.getInfinityBinCandidatePoolsWithoutBins({
      currencyA: query.currencyA,
      currencyB: query.currencyB,
      clientProvider: getViemClients,
    })
    return pools
  },
  {
    ttl: 1000,
    key: getCacheKey,
  },
)

export const getInfinityClCandidatePools = cacheByLRU(
  async (query: PoolQuery) => {
    if (!query.infinity) {
      return []
    }
    const { currencyA, currencyB } = query
    const pools = await InfinityRouter.getInfinityClCandidatePools({
      currencyA,
      currencyB,
      clientProvider: getViemClients,
    })
    return pools
  },
  {
    ttl: 1000,
    key: getCacheKey,
  },
)

export const getInfinityClCandidatePoolsWithoutTicks = cacheByLRU(
  async (query: PoolQuery) => {
    if (!query.infinity) {
      return []
    }
    const { currencyA, currencyB } = query
    const pools = await InfinityRouter.getInfinityClCandidatePoolsWithoutTicks({
      currencyA,
      currencyB,
      clientProvider: getViemClients,
    })
    return pools
  },
  {
    ttl: 1000,
    key: getCacheKey,
  },
)

export const getStableSwapPools = cacheByLRU(
  async (query: PoolQuery) => {
    const getViemClients = createViemPublicClientGetter()
    const blockNumber = query?.options?.blockNumber
    if (!blockNumber) {
      throw new Error('Failed to get pools on chain. Missing valid params')
    }
    const { currencyA, currencyB } = query
    const resolvedPairs = await SmartRouter.getPairCombinations(currencyA, currencyB)
    const pools = await SmartRouter.getStablePoolsOnChain(resolvedPairs ?? [], getViemClients, blockNumber)
    return pools
  },
  {
    ttl: 1000,
    key: getCacheKey,
  },
)
