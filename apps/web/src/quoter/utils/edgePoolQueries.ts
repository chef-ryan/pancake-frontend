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

import { v2Clients, v3Clients } from 'utils/graphql'
import { Address } from 'viem/accounts'
import { APIChain, getProvider, mockCurrency, Protocol } from './edgeQueries.util'

const fetchInfinityPools = async (addressA: Address, addressB: Address, chainId: ChainId) => {
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
}

const fetchV2Pools = async (addressA: Address, addressB: Address, chainId: ChainId) => {
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
}

const fetchV3Pools = async (addressA: Address, addressB: Address, chainId: ChainId) => {
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
}

const fetchSSPool = async (addressA: Address, addressB: Address, chainId: ChainId) => {
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
}

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
const fetchAllCandidatePools = async (
  addressA: Address,
  addressB: Address,
  chainId: ChainId,
  protocols: Protocol[],
) => {
  const queries = await Promise.all(
    protocols.map((protocol) => querySingleType(chainId, protocol as Protocol, addressA, addressB)),
  )
  const pools = queries.flat() as (InfinityPoolWithTvl | V2PoolWithTvl | V3PoolWithTvl | StablePoolWithTvl)[]
  return pools.map((pool) => {
    return SmartRouter.Transformer.serializePool(pool as Pool)
  })
}

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

export const poolTvlMap = async (
  protocols: ('v2' | 'v3' | 'infinityBin' | 'infinityCl' | 'stable')[],
  chain: APIChain,
) => {
  try {
    const remotePools = await fetchAllPools({
      baseUrl: 'https://explorer.pancakeswap.com/api/cached/pools/tvl-refs',
      protocols,
      chains: [chain],
      orderBy: 'tvlUSD',
      pageSize: 100,
    })
    const tvlMap: Record<string, string> = {}
    for (const pool of remotePools) {
      const tvlUSD = pool.tvlUSD
      const id = pool.id
      tvlMap[id] = tvlUSD
    }
    return tvlMap
  } catch (ex) {
    return {}
  }
}

type PaginatedResponse = {
  startCursor?: string
  endCursor?: string
  hasNextPage: boolean
  hasPrevPage: boolean
  rows: RemotePool[]
}

type RemotePool = {
  id: string
  chainId: number
  token0Price: string
  token1Price: string
  tvlToken0: string
  tvlToken1: string
  tvlUSD: string
  volumeUSD24h: string
  apr24h: string
  protocol: 'v2' | 'v3' | 'infinityBin' | 'infinityCl' | 'stable'
  feeTier: number
  token0: Token
  token1: Token
  isDynamicFee?: boolean
  hookAddress?: string | null
}

type Token = {
  id: string
  symbol: string
  name: string
  decimals: number
}

type FetchAllPoolsParams = {
  baseUrl: string
  orderBy?: 'tvlUSD' | 'volumeUSD24h' | 'apr24h'
  protocols: Array<'v2' | 'v3' | 'infinityBin' | 'infinityCl' | 'stable'>
  chains: Array<
    'bsc' | 'bsc-testnet' | 'ethereum' | 'base' | 'opbnb' | 'zksync' | 'polygon-zkevm' | 'linea' | 'arbitrum'
  >
  pools?: string[]
  tokens?: string[]
  pageSize?: number
  maxPages?: number // Optional safety limit for maximum pages to fetch
}

/**
 * Fetches all data from a paginated API endpoint
 * @param params Configuration parameters for the fetch operation
 * @returns Promise resolving to an array of all pools
 */
async function fetchAllPools({
  baseUrl,
  orderBy = 'tvlUSD',
  protocols,
  chains,
  pools = [],
  tokens = [],
  pageSize = 100,
  maxPages = Infinity,
}: FetchAllPoolsParams): Promise<RemotePool[]> {
  const allResults: RemotePool[] = []
  let cursor: string | null = null
  let hasNextPage = true
  let pageCount = 0

  // Construct the base URL params
  const buildUrlParams = (after?: string) => {
    const params = new URLSearchParams()

    // Add required parameters
    params.append('orderBy', orderBy)

    // Add protocols
    protocols.forEach((protocol) => {
      params.append('protocols', protocol)
    })

    // Add chains if tokens are not specified
    if (tokens.length === 0) {
      chains.forEach((chain) => {
        params.append('chains', chain)
      })
    }

    // Add pools if specified
    pools.forEach((pool) => {
      params.append('pools', pool)
    })

    // Add tokens if specified
    tokens.forEach((token) => {
      params.append('tokens', token)
    })

    // Add pagination parameters
    if (after) {
      params.append('after', after)
    }

    // Add page size
    params.append('limit', pageSize.toString())

    return params.toString()
  }

  while (hasNextPage && pageCount < maxPages) {
    const url = `${baseUrl}?${buildUrlParams(cursor || undefined)}`

    try {
      // eslint-disable-next-line no-await-in-loop
      const response = await fetch(url, {
        headers: {
          'x-api-key': process.env.EXPLORER_API_KEY || '',
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      // eslint-disable-next-line no-await-in-loop
      const data: PaginatedResponse = await response.json()

      // Add the current page of results
      allResults.push(...data.rows)

      // Update for next iteration
      hasNextPage = data.hasNextPage
      cursor = data.endCursor || null
      pageCount++
    } catch (error) {
      console.error('Error fetching data:', error)
      throw error
    }
  }

  if (pageCount >= maxPages && hasNextPage) {
    console.warn(`Reached maximum page limit of ${maxPages}. Some data may not have been fetched.`)
  }

  return allResults
}

export const edgeQueries = {
  fetchAllCandidatePools,
  fetchAllPools,
  fetchV2Pools,
  fetchV3Pools,
  fetchSSPool,
  fetchInfinityPools,
  querySingleType,
}
