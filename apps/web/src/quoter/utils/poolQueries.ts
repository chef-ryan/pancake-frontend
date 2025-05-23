import { ChainId } from '@pancakeswap/chains'
import { Protocol } from '@pancakeswap/farms'
import { InfinityRouter, Pool, SmartRouter, V2Pool, V3Pool } from '@pancakeswap/smart-router'
import { cacheByLRU } from '@pancakeswap/utils/cacheByLRU'
import { createAsyncCallWithFallbacks } from '@pancakeswap/utils/withFallback'
import { Tick } from '@pancakeswap/v3-sdk'
import { POOLS_FAST_REVALIDATE } from 'config/pools'
import { getPoolTicks } from 'hooks/useAllTicksQuery'
import memoize from 'lodash/memoize'
import { PoolQuery, PoolQueryOptions } from 'quoter/quoter.types'
import { v2Clients, v3Clients } from 'utils/graphql'
import { getViemClients } from 'utils/viem'
import { edgePoolQueryClient } from './edgePoolQueryClient'
import { PoolHashHelper } from './PoolHashHelper'

export const poolQueriesFactory = memoize((chainId: ChainId) => {
  const POOL_TTL = POOLS_FAST_REVALIDATE[chainId] || 10_000
  function getCacheKey(args: [PoolQuery, PoolQueryOptions] | [PoolQuery]) {
    const hash = PoolHashHelper.hashPoolQuery(args[0])
    return hash
  }

  function isValid(result: Pool[]) {
    return result && result.length > 0
  }

  const cacheOption = {
    ttl: POOL_TTL,
    key: getCacheKey,
    isValid,
    maxAge: 30_000,
    requestTimeout: 3_000,
  }

  const getV2CandidatePools = cacheByLRU(async (query: PoolQuery, options: PoolQueryOptions) => {
    const { currencyA, currencyB, blockNumber } = query

    const fallback = async () => {
      const provider = options.provider ?? getViemClients
      const pools = await SmartRouter.getV2CandidatePools({
        currencyA,
        currencyB,
        v2SubgraphProvider: ({ chainId }) => (chainId ? v2Clients[chainId] : undefined),
        v3SubgraphProvider: ({ chainId }) => (chainId ? v3Clients[chainId] : undefined),
        onChainProvider: provider,
      })
      return pools as V2Pool[]
    }
    const defaultQuery = async () => {
      return edgePoolQueryClient.getV2CandidatePools(currencyA!, currencyB!, chainId, blockNumber!)
    }

    const call = createAsyncCallWithFallbacks(defaultQuery, {
      fallbacks: [fallback],
      fallbackTimeout: 3_000,
    })
    return call()
  }, cacheOption)

  const getV3CandidatePools = cacheByLRU(async (query: PoolQuery, options: PoolQueryOptions) => {
    const { currencyA, currencyB, blockNumber } = query
    const fallback = async () => {
      const pools = await getV3CandidatePoolsWithoutTicks(query, options)
      return fillV3Ticks(pools)
    }
    const defaultQuery = async () => {
      return edgePoolQueryClient.getV3CandidatePools(currencyA!, currencyB!, chainId, blockNumber!)
    }

    const call = createAsyncCallWithFallbacks(defaultQuery, {
      fallbacks: [fallback],
      fallbackTimeout: 3_000,
    })
    return call()
  }, cacheOption)

  const getV3CandidatePoolsWithoutTicks = cacheByLRU(async (query: PoolQuery, options: PoolQueryOptions) => {
    const { currencyA, currencyB, blockNumber } = query
    const fallbackQuery = async () => {
      const provider = options.provider ?? getViemClients
      return SmartRouter.getV3CandidatePools({
        currencyA,
        currencyB,
        subgraphProvider: ({ chainId }) => (chainId ? v3Clients[chainId] : undefined),
        onChainProvider: provider,
        blockNumber,
      })
    }
    const defaultQuery = async () => {
      return edgePoolQueryClient.getV3CandidatePools(currencyA!, currencyB!, chainId, blockNumber!)
    }
    const call = createAsyncCallWithFallbacks(defaultQuery, {
      fallbacks: [fallbackQuery],
      fallbackTimeout: 3_000,
    })
    return call()
  }, cacheOption)

  const getV3PoolsWithTicksOnChain = cacheByLRU(async (query: PoolQuery, options: PoolQueryOptions) => {
    const { currencyA, currencyB, blockNumber } = query
    const fallback = async () => {
      const provider = options.provider ?? getViemClients

      const res = await InfinityRouter.getV3CandidatePools({
        currencyA: query.currencyA,
        currencyB: query.currencyB,
        clientProvider: provider,
        gasLimit: options?.gasLimit,
      })
      return res
    }
    const defaultQuery = async () => {
      return edgePoolQueryClient.getV3CandidatePools(currencyA!, currencyB!, chainId, blockNumber!)
    }
    const call = createAsyncCallWithFallbacks(defaultQuery, {
      fallbacks: [fallback],
      fallbackTimeout: 3_000,
    })
    return call()
  }, cacheOption)

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

  const getInfinityCandidatePoolsLight = cacheByLRU(async (query: PoolQuery, options: PoolQueryOptions) => {
    const { currencyA, currencyB, blockNumber } = query
    const fallback = async () => {
      const provider = options.provider ?? getViemClients
      const pools = await InfinityRouter.getInfinityCandidatePoolsLite({
        currencyA,
        currencyB,
        clientProvider: provider,
      })
      return pools
    }

    const defaultQuery = async () => {
      return edgePoolQueryClient.getInfinityCandidatePools(currencyA!, currencyB!, chainId, blockNumber!)
    }
    const call = createAsyncCallWithFallbacks(defaultQuery, {
      fallbacks: [fallback],
      fallbackTimeout: 3_000,
    })
    return call()
  }, cacheOption)

  const getInfinityCandidatePools = cacheByLRU(async (query: PoolQuery, options: PoolQueryOptions) => {
    const { currencyA, currencyB, blockNumber } = query

    const fallback = async () => {
      const provider = options.provider ?? getViemClients
      const pools = await InfinityRouter.getInfinityCandidatePools({
        currencyA,
        currencyB,
        clientProvider: provider,
      })

      return pools
    }
    const defaultQuery = async () => {
      return edgePoolQueryClient.getInfinityCandidatePools(currencyA!, currencyB!, chainId, blockNumber!)
    }
    const call = createAsyncCallWithFallbacks(defaultQuery, {
      fallbacks: [fallback],
      fallbackTimeout: 3_000,
    })
    return call()
  }, cacheOption)

  const getStableSwapPools = cacheByLRU(async (query: PoolQuery, options: PoolQueryOptions) => {
    const { currencyA, currencyB, blockNumber } = query

    const fallback = async () => {
      const provider = options.provider ?? getViemClients
      const resolvedPairs = await SmartRouter.getPairCombinations(currencyA, currencyB)
      const pools = await SmartRouter.getStablePoolsOnChain(resolvedPairs ?? [], provider, blockNumber)
      return pools
    }
    const defaultQuery = async () => {
      return edgePoolQueryClient.getSSCandidatePools(currencyA!, currencyB!, chainId, blockNumber!)
    }
    const call = createAsyncCallWithFallbacks(defaultQuery, {
      fallbacks: [fallback],
      fallbackTimeout: 3_000,
    })
    return call()
  }, cacheOption)

  return {
    getV2CandidatePools,
    getV3CandidatePools,
    getV3CandidatePoolsWithoutTicks,
    getV3PoolsWithTicksOnChain,
    getInfinityCandidatePoolsLight,
    getInfinityCandidatePools,
    getStableSwapPools,
  }
})

export const fetchCandidatePools = async (query: PoolQuery, options: PoolQueryOptions) => {
  const { chainId, currencyA, currencyB, blockNumber } = query
  const queries = poolQueriesFactory(chainId)
  if (!currencyA || !currencyB || !chainId || !blockNumber) {
    return []
  }
  const fallbackQuery = async () => {
    const poolsArray = await Promise.all([
      options.stableSwap ? queries.getStableSwapPools(query, options) : ([] as Pool[]),
      options.v2Pools ? queries.getV2CandidatePools(query, options) : ([] as Pool[]),
      options.v3Pools ? queries.getV3PoolsWithTicksOnChain(query, options) : ([] as Pool[]),
      options.infinity ? queries.getInfinityCandidatePools(query, options) : ([] as Pool[]),
    ])
    return poolsArray.flat() as Pool[]
  }

  const defaultQuery = async () => {
    const protocols = protocolsFromQuery(options)
    return edgePoolQueryClient.getAllCandidates(currencyA, currencyB, chainId, blockNumber, protocols, options.signal)
  }

  const call = createAsyncCallWithFallbacks(defaultQuery, {
    fallbacks: [fallbackQuery],
    fallbackTimeout: 3_000,
  })

  return call()
}

export const fetchCandidatePoolsLite = async (query: PoolQuery, options: PoolQueryOptions) => {
  const { chainId, currencyA, currencyB, blockNumber } = query
  const queries = poolQueriesFactory(chainId)
  if (!currencyA || !currencyB || !chainId || !blockNumber) {
    return []
  }

  const fallbackQuery = async () => {
    const poolsArray = await Promise.all([
      options.stableSwap ? queries.getStableSwapPools(query, options) : ([] as Pool[]),
      options.v2Pools ? queries.getV2CandidatePools(query, options) : ([] as Pool[]),
      options.v3Pools ? queries.getV3CandidatePoolsWithoutTicks(query, options) : ([] as Pool[]),
      options.infinity ? queries.getInfinityCandidatePoolsLight(query, options) : ([] as Pool[]),
    ])
    return poolsArray.flat() as Pool[]
  }

  const defaultQuery = async () => {
    const protocols = protocolsFromQuery(options)
    return edgePoolQueryClient.getAllCandidates(currencyA, currencyB, chainId, blockNumber, protocols)
  }

  const call = createAsyncCallWithFallbacks(defaultQuery, {
    fallbacks: [fallbackQuery],
    fallbackTimeout: 3_000,
  })

  return call()
}

const protocolsFromQuery = (query: PoolQueryOptions) => {
  const protocols: string[] = []
  if (query.stableSwap) {
    protocols.push('ss')
  }
  if (query.v2Pools) {
    protocols.push('v2')
  }
  if (query.v3Pools) {
    protocols.push('v3')
  }
  if (query.infinity) {
    protocols.push('infinity')
  }
  return protocols
}
