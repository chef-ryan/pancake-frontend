import { ChainId, chainNamesInKebabCase } from '@pancakeswap/chains'
import {
  FarmV4SupportedChainId,
  fetchAllUniversalFarms,
  Protocol,
  supportedChainIdV4,
  UniversalFarmConfig,
} from '@pancakeswap/farms'
import { getCurrencyAddress, Pair } from '@pancakeswap/sdk'
import { InfinityBinPool, InfinityClPool, InfinityRouter, SmartRouter } from '@pancakeswap/smart-router'

import { SORT_ORDER } from '@pancakeswap/uikit'
import uniqBy from '@pancakeswap/utils/uniqBy'
import { computePoolAddress, DEPLOYER_ADDRESSES } from '@pancakeswap/v3-sdk'
import { edgeQueries } from 'quoter/utils/edgePoolQueries'
import { getEdgeChainName } from 'quoter/utils/edgeQueries.util'
import { PoolInfo } from 'state/farmsV4/state/type'
import { explorerApiClient } from 'state/info/api/client'
import { isInfinityProtocol } from 'utils/protocols'
import { Address } from 'viem/accounts'
import { FarmInfo, getFarmTokens, isDynamic, normalizeAddress, SerializedFarmInfo } from './farm.util'

const DEFAULT_PROTOCOLS: Protocol[] = Object.values(Protocol)
const DEFAULT_CHAINS: FarmV4SupportedChainId[] = Object.values(supportedChainIdV4)
export interface FarmQuery {
  keywords: string
  chains: ChainId[]
  protocols: Protocol[]
  sortBy: keyof PoolInfo | null
  sortOrder: SORT_ORDER
  activeChainId?: ChainId
}

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

async function fetchExplorerFarmPools(protocols: Protocol[], chainIds: typeof supportedChainIdV4) {
  const chains = chainIds.map((chainId) => getEdgeChainName(chainId as FarmV4SupportedChainId))
  const resp = await explorerApiClient.GET('/cached/pools/farming', {
    params: {
      query: {
        protocols: protocols ?? DEFAULT_PROTOCOLS,
        chains,
      },
    },
    headers: {
      EXPLORER_API_KEY: process.env.EXPLORER_API_KEY,
    },
  })

  return (resp.data || []) as InfinityRouter.RemotePoolBase[]
}

function toRemotePool(farm: UniversalFarmConfig) {
  const { token0, token1 } = farm
  const poolBase: InfinityRouter.RemotePoolBase = {
    id: getPoolId(farm),
    chainId: farm.chainId,
    tvlUSD: '0',
    apr24h: '0',
    volumeUSD24h: '0',
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
    // @ts-ignore
    feeTier: farm.feeAmount,
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

async function fetchFarms(query: { extend: boolean; protocol?: Protocol }) {
  const protocols = DEFAULT_PROTOCOLS
  const { extend, protocol } = query
  if (!extend) {
    return fetchExplorerFarmPools(protocols, supportedChainIdV4)
  }
  return fetchAllExplorerPools(protocol ? [protocol] : protocols, supportedChainIdV4)
}

async function queryFarms(extend: boolean, protocol?: Protocol) {
  try {
    const [pools, universalFarms] = await Promise.all([fetchFarms({ extend, protocol }), fetchAllUniversalFarms()])

    const farmMaps = universalFarms.reduce((acc, farm) => {
      const id = getPoolId(farm)
      return {
        ...acc,
        [`${farm.chainId}:${id}`]: {
          pid: farm.pid,
          lpAddress: farm.lpAddress,
        },
      }
    }, {} as Record<Address, number | undefined>)
    const universalFarmPools = universalFarms.map((x) => toRemotePool(x))

    const all = (extend ? [...pools] : [...pools, ...universalFarmPools])
      .map(normalizeAddress)
      .filter((x) => x) as InfinityRouter.RemotePoolBase[]

    const allPools = uniqBy(all, (p) => `${p.chainId}:${p.id}`).map((pool) => {
      const remotePool = InfinityRouter.parseRemotePool(pool as InfinityRouter.RemotePool)
      // @ts-ignore
      if (typeof remotePool.tvlUSD !== 'undefined') {
        // @ts-ignore
        remotePool.tvlUSD = remotePool.tvlUSD.toString()
      }

      const farmInfo = farmMaps[`${pool.chainId}:${pool.id}`]
      const pid = farmInfo ? farmInfo.pid : undefined
      const lpAddress = farmInfo ? farmInfo.lpAddress : undefined
      return {
        pool: SmartRouter.Transformer.serializePool(remotePool),
        id: pool.id,
        chainId: pool.chainId,
        protocol: pool.protocol,
        tvlUSD: pool.tvlUSD || '0',
        vol24hUsd: pool.volumeUSD24h || '0',
        pid,
        apr24h: Number(pool.apr24h || 0),
        isDynamicFee: pool.isDynamicFee,
        feeTier: pool.feeTier,
        lpAddress: lpAddress || pool.id,
      } as SerializedFarmInfo
    })
    return allPools
  } catch (ex) {
    console.warn('Error fetching farms:', ex)
    return []
  }
}

async function fetchAllExplorerPools(protocols: Protocol[], chains: typeof supportedChainIdV4) {
  const query = {
    baseUrl: `${process.env.NEXT_PUBLIC_EXPLORE_API_ENDPOINT}/cached/pools/list`,
    protocols,
    chains: chains.map((chain) => getEdgeChainName(chain)),
    maxPages: 5,
  }
  const pools = await edgeQueries.fetchAllPools(query)
  return pools
}

export default {
  queryFarms,
  filterKeywords,
}
