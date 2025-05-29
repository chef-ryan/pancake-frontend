import { chainNamesInKebabCase } from '@pancakeswap/chains'
import { FarmV4SupportedChainId, fetchAllUniversalFarms, Protocol, UniversalFarmConfig } from '@pancakeswap/farms'
import { getCurrencyAddress, Pair } from '@pancakeswap/sdk'
import { InfinityBinPool, InfinityClPool, InfinityRouter, SmartRouter } from '@pancakeswap/smart-router'

import uniqBy from '@pancakeswap/utils/uniqBy'
import { computePoolAddress, DEPLOYER_ADDRESSES } from '@pancakeswap/v3-sdk'
import { edgeQueries } from 'edge/edgePoolQueries'
import { getEdgeChainName } from 'edge/edgeQueries.util'
import { DEFAULT_PROTOCOLS } from 'state/farmsV4/state/farmPools/fetcher'
import { PoolInfo } from 'state/farmsV4/state/type'
import { explorerApiClient } from 'state/info/api/client'
import { isInfinityProtocol } from 'utils/protocols'
import { Address } from 'viem/accounts'
import { FarmInfo, getFarmTokens, isDynamic } from './farm.util'
import { farmFilters } from './filters'

export interface FarmQuery {
  protocols?: Protocol[]
  chains?: FarmV4SupportedChainId[]
  pageNo?: number
  address?: string
}

type Farm = UniversalFarmConfig | PoolInfo

function getPoolId(farm: UniversalFarmConfig) {
  if (farm.protocol === 'v3') {
    const deployerAddress = DEPLOYER_ADDRESSES[farm.chainId]
    const id = computePoolAddress({
      deployerAddress: deployerAddress as Address,
      tokenA: farm.token0.wrapped,
      tokenB: farm.token1.wrapped,
      fee: farm.feeAmount,
    })
    return id
  }
  if (farm.protocol === 'v2') {
    const id = Pair.getAddress(farm.token0.wrapped, farm.token1.wrapped)
    return id
  }
  if (farm.protocol === 'stable') {
    return farm.stableSwapAddress
  }
  if (farm.protocol === 'infinityCl' || farm.protocol === 'infinityBin') {
    return farm.poolId
  }
  throw new Error(`Unsupported protocol: ${farm.protocol}`)
}

const addressFilter = {
  matcher: (keywords: string[]) => {
    return keywords.find((keyword) => keyword.match(/^0x/) && keyword.length > 6)
  },
  selector: (farm: FarmInfo, keyword: string) => {
    const [token0, token1] = getFarmTokens(farm)
    const addresses = [farm.id, getCurrencyAddress(token0), getCurrencyAddress(token1)]
    return addresses.some((address) => address.toLowerCase().includes(keyword))
  },
}

const tagFilter = {
  matcher: (keywords: string[]) => {
    const tags = ['dynamic', 'clamm', 'cbamm']
    return keywords.find((kw) => {
      return tags.some((tag) => tag.startsWith(kw))
    })
  },
  filter: (farm: FarmInfo, keyword: string) => {
    if (!isInfinityProtocol(farm.protocol)) {
      return false
    }
    const { pool } = farm

    if ('dynamic'.startsWith(keyword)) {
      return isDynamic(pool as InfinityClPool | InfinityBinPool)
    }
    if ('clamm'.startsWith(keyword)) {
      return farm.protocol === 'infinityCl'
    }
    if ('cbamm'.startsWith(keyword)) {
      return farm.protocol === 'infinityBin'
    }
    return false
  },
}

const symbolFilter = {
  matcher: (keywords: string[]) => {
    return keywords.find((kw) => kw.match(/^[a-zA-Z0-9/]+$/))
  },
  filter: (farm: FarmInfo, keyword: string) => {
    const [token0, token1] = getFarmTokens(farm)
    const symbol = [token0.symbol, token1.symbol].join('/')
    return symbol.toLowerCase().includes(keyword.toLowerCase())
  },
}

const parseKeywords = (keywordStr: string) => {
  return keywordStr
    .split(/[,\s]/)
    .map((x) => x.trim())
    .filter((x) => x)
    .map((k) => k.toLowerCase())
}

const filterKeywords = (keywordRaw?: string) => {
  const keywords = parseKeywords(keywordRaw || '')
  const matchedAddrKw = addressFilter.matcher(keywords)
  const isMatchTag = tagFilter.matcher(keywords)
  const isMatchSymbol = symbolFilter.matcher(keywords)

  return (farm: FarmInfo) => {
    if (!keywordRaw) return true

    let match = false
    if (matchedAddrKw) {
      match = addressFilter.selector(farm, matchedAddrKw)
    }
    if (!match && isMatchTag) {
      match = tagFilter.filter(farm, isMatchTag)
    }
    if (!match && isMatchSymbol) {
      match = symbolFilter.filter(farm, isMatchSymbol)
    }
    return match
  }
}

export type ChainNameKebab = (typeof chainNamesInKebabCase)[keyof typeof chainNamesInKebabCase]

async function fetchExplorerFarmPools(protocols: Protocol[], chainIds: number[]) {
  const chains = chainIds.map((chainId) => getEdgeChainName(chainId as FarmV4SupportedChainId))
  const resp = await explorerApiClient.GET('/cached/pools/farming', {
    params: {
      query: {
        protocols: protocols ?? DEFAULT_PROTOCOLS,
        chains,
      },
    },
  })
  return (resp.data || []) as InfinityRouter.RemotePoolBase[]
}

function toRemotePool(farm: UniversalFarmConfig) {
  const token0 = farm.token0
  const token1 = farm.token1
  const poolBase: InfinityRouter.RemotePoolBase = {
    id: getPoolId(farm),
    chainId: farm.chainId,
    tvlUSD: '0',
    protocol: farm.protocol,
    token0: {
      id: getCurrencyAddress(token0),
      decimals: farm.token0.decimals,
      symbol: farm.token0.symbol,
    },
    token1: {
      id: getCurrencyAddress(token1),
      decimals: farm.token1.decimals,
      symbol: farm.token1.symbol,
    },
  }
  if (farm.protocol === 'v2') {
    return poolBase as InfinityRouter.RemotePoolV2
  }
  if (farm.protocol === 'v3') {
    return {
      ...poolBase,
      feeTier: farm.feeAmount,
    } as InfinityRouter.RemotePoolV3
  }

  return poolBase
}

async function queryFarms(query: FarmQuery) {
  const { protocols = [], chains = [], pageNo = 1 } = query
  try {
    const [pools, universalFarms, extendPools] = await Promise.all([
      fetchExplorerFarmPools(protocols, chains),
      fetchAllUniversalFarms(),
      fetchAllExplorerPools(protocols, chains),
    ])
    const universalFarmPools = universalFarms.map((x) => toRemotePool(x))

    const allPools = uniqBy([...pools, ...universalFarmPools, ...extendPools], (p) => p.id)
      .filter(farmFilters.chainFilter(chains))
      .filter(farmFilters.protocolFilter(protocols))
      .map((pool) => {
        const remotePool = InfinityRouter.parseRemotePool(pool as InfinityRouter.RemotePool)
        // @ts-ignore
        if (typeof remotePool.tvlUSD !== 'undefined') {
          // @ts-ignore
          delete remotePool.tvlUSD
        }

        return {
          pool: SmartRouter.Transformer.serializePool(remotePool),
          id: pool.id,
          chainId: pool.chainId,
        } as FarmInfo
      })
    // for (const pool of allPools) {
    //   try {
    //     JSON.stringify(pool)
    //   } catch {
    //     console.log(pool)
    //   }
    // }

    return allPools.slice(0, 100)
  } catch (ex) {
    console.error('Error fetching farms:', ex)
    return []
  }
}

async function fetchAllExplorerPools(protocols: Protocol[], chains: FarmV4SupportedChainId[], address?: Address) {
  if (!address) {
    return []
  }
  const query = {
    baseUrl: `${process.env.NEXT_PUBLIC_EXPLORE_API_ENDPOINT}/cached/pools/list`,
    protocols,
    chains: chains.map((chain) => getEdgeChainName(chain)),
    maxPages: 1,
    token: [address],
    pool: [address],
  }
  const pools = await edgeQueries.fetchAllPools(query)
  return pools
}

export default {
  queryFarms,
  filterKeywords,
}
