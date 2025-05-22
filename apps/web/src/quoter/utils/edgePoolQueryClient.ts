import { ChainId } from '@pancakeswap/chains'
import { InfinityBinPool, InfinityClPool, SmartRouter, StablePool, V2Pool, V3Pool } from '@pancakeswap/smart-router'

import { Currency, getCurrencyAddress } from '@pancakeswap/swap-sdk-core'
import { cacheByLRU } from '@pancakeswap/utils/cacheByLRU'
import { takeFirstFulfilled } from '@pancakeswap/utils/promise'
import { POOLS_FAST_REVALIDATE } from 'config/pools'
import { poolQueryPersistURL } from 'pages/api/infinity/edgePoolQueries'
import qs from 'qs'
import { PoolHashHelper } from './PoolHashHelper'

type Protocol = 'v2' | 'ss' | 'v3' | 'infinity'
const _fetchPools = async function <T>(
  currencyA: Currency,
  currencyB: Currency,
  chainId: ChainId,
  protocols: Protocol[],
  blockNumber: number,
): Promise<T> {
  const addressA = getCurrencyAddress(currencyA)
  const addressB = getCurrencyAddress(currencyB)
  const query = qs.stringify({
    addressA,
    addressB,
    chainId,
    protocol: protocols.join(','),
    blockNumber,
  })
  const currentEpoch = Math.floor(Date.now() / POOLS_FAST_REVALIDATE[chainId])
  const { url: urlPrevious } = poolQueryPersistURL(addressA, addressB, chainId, protocols, currentEpoch - 1)

  async function fetchCDN(url: string) {
    const resp = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (!resp.ok) {
      throw new Error(`Failed to fetch pools: ${await resp.text()}`)
    }
    return resp.json()
  }

  const queryApi = async () => {
    const res = await fetch(`/api/infinity/candidates?${query}`)

    if (!res.ok) {
      throw new Error(`Failed to fetch pools: ${await res.text()}`)
    }
    return res.json()
  }

  const json = (await takeFirstFulfilled([fetchCDN(urlPrevious), fetchCDN(urlPrevious), queryApi()])) as {
    lastUpdated: number
    data: T
  }

  return json.data
}

const getV2CandidatePools = async (currencyA: Currency, currencyB: Currency, chainId: ChainId, blockNumber: number) => {
  const pools = await fetchPools<SmartRouter.Transformer.SerializedV2Pool[]>(
    currencyA,
    currencyB,
    chainId,
    ['v2'],
    blockNumber,
  )
  return pools.map((pool) => SmartRouter.Transformer.parsePool(chainId, pool) as V2Pool)
}

const getV3CandidatePools = async (currencyA: Currency, currencyB: Currency, chainId: ChainId, blockNumber: number) => {
  const pools = await fetchPools<SmartRouter.Transformer.SerializedV3Pool[]>(
    currencyA,
    currencyB,
    chainId,
    ['v3'],
    blockNumber,
  )
  return pools.map((pool) => SmartRouter.Transformer.parsePool(chainId, pool) as V3Pool)
}

const getSSCandidatePools = async (currencyA: Currency, currencyB: Currency, chainId: ChainId, blockNumber: number) => {
  const pools = await fetchPools<SmartRouter.Transformer.SerializedStablePool[]>(
    currencyA,
    currencyB,
    chainId,
    ['ss'],
    blockNumber,
  )
  return pools.map((pool) => SmartRouter.Transformer.parsePool(chainId, pool) as StablePool)
}

const getInfinityCandidatePools = async (
  currencyA: Currency,
  currencyB: Currency,
  chainId: ChainId,
  blockNumber: number,
) => {
  const pools = await fetchPools<
    (SmartRouter.Transformer.SerializedInfinityBinPool | SmartRouter.Transformer.SerializedInfinityClPool)[]
  >(currencyA, currencyB, chainId, ['infinity'], blockNumber)
  const filtered = pools.map((pool) => SmartRouter.Transformer.parsePool(chainId, pool))
  return filtered as (InfinityClPool | InfinityBinPool)[]
}

const fetchPools = cacheByLRU(_fetchPools, {
  ttl: 3_000,
  key: (args) => {
    const [currencyA, currencyB, chainId, protocol, blockNumber] = args
    const hashc = PoolHashHelper.hashCurrencies(currencyA, currencyB)
    return `${hashc}-${chainId}-${protocol.join(',')}-${blockNumber}`
  },
  usingStaleValue: false,
})

const getAllCandidates = async (
  currencyA: Currency,
  currencyB: Currency,
  chainId: ChainId,
  blockNumber: number,
  protocols: string[],
) => {
  const pools = await fetchPools<SmartRouter.Transformer.SerializedPool[]>(
    currencyA,
    currencyB,
    chainId,
    protocols as Protocol[],
    blockNumber,
  )
  return pools.map((pool) => {
    return SmartRouter.Transformer.parsePool(chainId, pool)
  })
}

export const edgePoolQueryClient = {
  getAllCandidates,
  getV2CandidatePools,
  getV3CandidatePools,
  getSSCandidatePools,
  getInfinityCandidatePools,
}
