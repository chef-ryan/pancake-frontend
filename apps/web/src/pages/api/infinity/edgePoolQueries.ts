import { ChainId, getChainName } from '@pancakeswap/chains'
import { hooksList } from '@pancakeswap/infinity-sdk'
import {
  getPoolAddress,
  InfinityBinPool,
  InfinityClPool,
  InfinityPoolWithTvl,
  InfinityRouter,
  Pool,
  PoolType,
  SmartRouter,
  StablePoolWithTvl,
  V2PoolWithTvl,
  V3PoolWithTvl,
  WithTvl,
} from '@pancakeswap/smart-router'
import { cacheByLRU, CacheOptions, calcCacheKey, persistKey, PersistOption } from '@pancakeswap/utils/cacheByLRU'
import memoize from '@pancakeswap/utils/memoize'

import { POOLS_SLOW_REVALIDATE } from 'config/pools'
import { v2Clients, v3Clients } from 'utils/graphql'
import { Address } from 'viem/accounts'
import { APIChain, poolTvlMap } from './pools'
import { getProvider, mockCurrency, Protocol } from './util'

const persistOption: PersistOption = {
  type: 'r2',
  name: 'candidates',
  version: 'v1',
}

export const poolQueryPersistURL = (
  addressA: Address,
  addressB: Address,
  chainId: ChainId,
  protocols: Protocol[],
  epoch: number,
) => {
  const cacheKey = calcCacheKey(cacheKeyFn([addressA, addressB, chainId, protocols]) as any, epoch)
  const key = persistKey(cacheKey, persistOption)
  return {
    cacheKey,
    key,
    url: `${process.env.NEXT_PUBLIC_PROOF_API}/cache/${key}`,
  }
}

const cacheKeyFn = (args: [Address, Address, ChainId, Protocol[]]) => {
  const sort = [args[0], args[1]].sort()
  const key = [sort[0], sort[1], args[2], args[3]]
  return key
}
type FN = (
  addressA: Address,
  addressB: Address,
  chainId: ChainId,
  protocol: Protocol[],
) => Promise<SmartRouter.Transformer.SerializedPool[]>

export const poolQueriesFactory = memoize((chainId: ChainId) => {
  const cacheTime = POOLS_SLOW_REVALIDATE[chainId] as number
  const cacheOption = {
    ttl: cacheTime,
    requestTimeout: cacheTime / 2,
    maxCacheSize: 1_000_000,
    maxAge: 300_000, // For stale values
    cacheNextEpochOnHalfTTS: true,
    parallelism: 5,
  }

  const fetchInfinityPools = cacheByLRU(async (addressA: Address, addressB: Address, chainId: ChainId) => {
    const pools = await InfinityRouter.fetchInfinityPoolsFromApi(addressA, addressB, chainId)
    const localPools = pools
      .map((pool) => {
        return InfinityRouter.toLocalInfinityPool(pool, chainId as keyof typeof hooksList)
      })
      .filter((x) => x) as InfinityPoolWithTvl[]
    const currencyA = mockCurrency(addressA, chainId)
    const currencyB = mockCurrency(addressB, chainId)
    const filtered = SmartRouter.infinityPoolTvlSelector(currencyA, currencyB, localPools)
    const clPools = filtered.filter((pool) => pool.type === PoolType.InfinityCL) as InfinityClPool[]
    const binPools = filtered.filter((pool) => pool.type === PoolType.InfinityBIN) as InfinityBinPool[]

    const [poolWithTicks, poolWithBins] = await Promise.all([
      InfinityRouter.fillClPoolsWithTicks({
        pools: clPools,
        clientProvider: getProvider(),
      }),
      InfinityRouter.fillPoolsWithBins({
        pools: binPools,
        clientProvider: getProvider(),
      }),
    ])
    return [...poolWithTicks, ...poolWithBins]
  }, cacheOption)

  const fetchV2Pools = cacheByLRU(async (addressA: Address, addressB: Address, chainId: ChainId) => {
    const currencyA = mockCurrency(addressA, chainId)
    const currencyB = mockCurrency(addressB, chainId)

    const pools = await SmartRouter.getV2CandidatePools({
      currencyA,
      currencyB,
      onChainProvider: getProvider(),
      v3SubgraphProvider: v3Clients[chainId],
      v2SubgraphProvider: v2Clients[chainId],
      fallbackTimeout: 5_000,
    })
    return pools
  }, cacheOption)

  const fetchV3Pools = cacheByLRU(async (addressA: Address, addressB: Address, chainId: ChainId) => {
    const currencyA = mockCurrency(addressA, chainId)
    const currencyB = mockCurrency(addressB, chainId)

    const pools = await InfinityRouter.getV3CandidatePools({
      currencyA,
      currencyB,
      clientProvider: getProvider(),
    })

    const chain = getChainName(chainId)
    const tvlMap = await poolTvlMap(['v3'], chain as APIChain)
    const poolsWithTvl = fillTvl(tvlMap, pools) as V3PoolWithTvl[]
    return SmartRouter.v3PoolTvlSelector(currencyA, currencyB, poolsWithTvl)
  }, cacheOption)

  const fetchSSPool = cacheByLRU(async (addressA: Address, addressB: Address, chainId: ChainId) => {
    const currencyA = mockCurrency(addressA, chainId)
    const currencyB = mockCurrency(addressB, chainId)
    const client = getProvider()
    const blockNumber = await client({ chainId })?.getBlockNumber()

    const pools = await SmartRouter.getStableCandidatePools({
      currencyA,
      currencyB,
      onChainProvider: getProvider(),
      blockNumber,
    })

    const chain = getChainName(chainId)
    const tvlMap = await poolTvlMap(['stable'], chain as APIChain)
    return fillTvl(tvlMap, pools) as StablePoolWithTvl[]
  }, cacheOption)

  const querySingleType = async (chainId: ChainId, protocol: Protocol, addressA: Address, addressB: Address) => {
    switch (protocol) {
      case 'v2': {
        return fetchV2Pools(addressA, addressB, chainId)
      }
      case 'ss': {
        return fetchSSPool(addressA, addressB, chainId)
      }
      case 'v3': {
        return fetchV3Pools(addressA, addressB, chainId)
      }
      case 'infinity': {
        return fetchInfinityPools(addressA, addressB, chainId)
      }
      default:
        throw new Error('invalid pool')
    }
  }

  const cacheOptionForQueryAll: CacheOptions<FN> = {
    ttl: cacheTime,
    requestTimeout: cacheTime / 2,
    maxCacheSize: 1_000_000,
    persist: persistOption,
    maxAge: 300_000, // For stale values
    key: cacheKeyFn,
    cacheNextEpochOnHalfTTS: true,
  }

  const queryAllPools = cacheByLRU(
    async (addressA: Address, addressB: Address, chainId: ChainId, protocols: Protocol[]) => {
      const queries = await Promise.all(
        protocols.map((protocol) => querySingleType(chainId, protocol as Protocol, addressA, addressB)),
      )
      const pools = queries.flat() as (InfinityPoolWithTvl | V2PoolWithTvl | V3PoolWithTvl | StablePoolWithTvl)[]
      return pools.map((pool) => {
        return SmartRouter.Transformer.serializePool(pool as Pool)
      })
    },
    cacheOptionForQueryAll,
  )

  return {
    fetchInfinityPools,
    fetchV2Pools,
    fetchV3Pools,
    fetchSSPool,
    fetchAllPools: queryAllPools,
  }
})

function fillTvl(tvlMap: Record<string, string>, pools: Pool[]) {
  return pools.map((pool) => {
    const id = getPoolAddress(pool)
    const tvlUSD = tvlMap[id] || '0'
    if ('tvlUSD' in pool) {
      return { ...pool, tvlUSD }
    }
    return pool as Pool & WithTvl
  })
}
