import { ChainId } from '@pancakeswap/chains'
import { hooksList } from '@pancakeswap/infinity-sdk'
import {
  InfinityBinPool,
  InfinityClPool,
  InfinityPoolWithTvl,
  InfinityRouter,
  PoolType,
  SmartRouter,
} from '@pancakeswap/smart-router'
import { cacheByLRU, CacheOptions } from '@pancakeswap/utils/cacheByLRU'
import memoize from '@pancakeswap/utils/memoize'

import { POOLS_FAST_REVALIDATE } from 'config/pools'
import { v2Clients, v3Clients } from 'utils/graphql'
import { Address } from 'viem/accounts'
import { getProvider, mockCurrency } from './util'

export const poolQueriesFactory = memoize((chainId: ChainId) => {
  const cacheTime = POOLS_FAST_REVALIDATE[chainId] as number
  const cacheOption: CacheOptions<any> = {
    ttl: cacheTime,
    requestTimeout: 3_000,
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
    const result = [...poolWithTicks, ...poolWithBins].map((p) => {
      return SmartRouter.Transformer.serializePool(p)
    })
    return result
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
    return pools.map((pool) => {
      return SmartRouter.Transformer.serializePool(pool)
    })
  }, cacheOption)

  const fetchV3Pools = cacheByLRU(async (addressA: Address, addressB: Address, chainId: ChainId) => {
    const currencyA = mockCurrency(addressA, chainId)
    const currencyB = mockCurrency(addressB, chainId)

    const pools = await SmartRouter.getV3CandidatePools({
      currencyA,
      currencyB,
      onChainProvider: getProvider(),
    })

    return pools.map((pool) => {
      return SmartRouter.Transformer.serializePool(pool)
    })
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

    return pools.map((pool) => {
      return SmartRouter.Transformer.serializePool(pool)
    })
  }, cacheOption)

  return {
    fetchInfinityPools,
    fetchV2Pools,
    fetchV3Pools,
    fetchSSPool,
  }
})
