import { ChainId, chainNamesInKebabCase } from '@pancakeswap/chains'
import { FarmV4SupportedChainId, fetchAllUniversalFarms, Protocol, UniversalFarmConfig } from '@pancakeswap/farms'
import { getCurrencyAddress, Pair } from '@pancakeswap/sdk'
import { InfinityBinPool, InfinityClPool, InfinityRouter, SmartRouter } from '@pancakeswap/smart-router'

import { chainlinkOracleCAKE } from '@pancakeswap/prediction'
import uniqBy from '@pancakeswap/utils/uniqBy'
import { formatUnits } from '@pancakeswap/utils/viem/formatUnits'
import { computePoolAddress, DEPLOYER_ADDRESSES } from '@pancakeswap/v3-sdk'
import BigNumber from 'bignumber.js'
import { chainlinkOracleABI } from 'config/abi/chainlinkOracle'
import { edgeQueries } from 'edge/edgePoolQueries'
import { getEdgeChainName } from 'edge/edgeQueries.util'
import { fetchAllCampaignsByChainId } from 'hooks/infinity/useCampaigns'
import { getInfinityCakeAPR } from 'hooks/infinity/useInfinityCakeAPR'
import groupBy from 'lodash/groupBy'
import { CakeAprValue } from 'state/farmsV4/atom'
import { DEFAULT_PROTOCOLS } from 'state/farmsV4/state/farmPools/fetcher'
import { getAllNetworkMerklApr, getCakeApr, getLpApr } from 'state/farmsV4/state/poolApr/fetcher'
import { PoolInfo } from 'state/farmsV4/state/type'
import { explorerApiClient } from 'state/info/api/client'
import { safeGetAddress } from 'utils'
import { isInfinityProtocol } from 'utils/protocols'
import { getViemClients } from 'utils/viem.server'
import { Address } from 'viem/accounts'
import {
  FarmInfo,
  FarmProps,
  farmPropsToPoolInfoBase,
  getFarmTokens,
  getSerializedFarmTokens,
  isDynamic,
  SerializedFarmInfo,
} from './farm.util'
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

const sortWithPid = (a: FarmProps, b: FarmProps) => {
  if (a.pid && !b.pid) {
    return -1
  }
  if (!a.pid && b.pid) {
    return 1
  }
  return 0
}

async function queryFarms(query: FarmQuery) {
  const { protocols = [], chains = [], pageNo = 1 } = query
  try {
    const [pools, universalFarms, extendPools] = await Promise.all([
      fetchExplorerFarmPools(protocols, chains),
      fetchAllUniversalFarms(),
      fetchAllExplorerPools(protocols, chains),
    ])
    const pidsMaps = universalFarms.reduce((acc, farm) => {
      const id = getPoolId(farm)
      return {
        ...acc,
        [`${farm.chainId}:${id}`]: farm.pid,
      }
    }, {} as Record<Address, number | undefined>)
    console.log(pidsMaps)
    const universalFarmPools = universalFarms.map((x) => toRemotePool(x))

    // Ensure Checksum id
    const all = [...pools, ...universalFarmPools, ...extendPools]
      .map((pool) => {
        if (pool.id) {
          const id = safeGetAddress(pool.id)
          if (!id) {
            return null
          }
          // eslint-disable-next-line no-param-reassign
          pool.id = id
        }
        return pool
      })
      .filter((x) => x) as InfinityRouter.RemotePoolBase[]

    const allPools = uniqBy(all, (p) => `${p.chainId}:${p.id}`)
      .filter(farmFilters.chainFilter(chains))
      .filter(farmFilters.protocolFilter(protocols))
      .map((pool) => {
        const remotePool = InfinityRouter.parseRemotePool(pool as InfinityRouter.RemotePool)
        // @ts-ignore
        if (typeof remotePool.tvlUSD !== 'undefined') {
          // @ts-ignore
          remotePool.tvlUSD = remotePool.tvlUSD.toString()
        }

        return {
          pool: SmartRouter.Transformer.serializePool(remotePool),
          id: pool.id,
          chainId: pool.chainId,
          protocol: pool.protocol,
          // @ts-ignore
          tvlUSD: pool.tvlUSD?.toString() || 0,
          pid: pidsMaps[`${pool.chainId}:${pool.id}`],
        } as SerializedFarmInfo
      })
      .slice(0, 100)

    await fillLpAprData(allPools)
    await fillMerklAprData(allPools)
    await fillCakeApr(allPools)
    return allPools
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

async function fillLpAprData(farms: SerializedFarmInfo[]) {
  const lpAprs = await Promise.all(
    farms.map((farm) =>
      getLpApr(
        {
          protocol: farm.protocol,
          chainId: farm.chainId,
          lpAddress: farm.id,
          poolId: farm.id,
        },
        true,
      ).catch((ex) => {
        // console.error(`Failed to fetch LP APR for farm ${farm.protocol} ${farm.chainId} ${farm.id}`, ex)
      }),
    ),
  )

  farms.forEach((farm, index) => {
    const lpApr = lpAprs[index]
    // eslint-disable-next-line no-param-reassign
    farm.lpApr = `${lpApr || '0'}`
  })
}

async function fillMerklAprData(farms: SerializedFarmInfo[]) {
  const aprs = await getAllNetworkMerklApr()
  farms.forEach((farm) => {
    const key = `${farm.chainId}-${farm.id}`
    const merklApr = aprs[key] || '0'
    // eslint-disable-next-line no-param-reassign
    farm.merklApr = merklApr
  })
}

async function fillCakeApr(farms: SerializedFarmInfo[]) {
  const cakePrice = BigNumber(await getCakePriceFromOracle())
  const groups = groupBy(farms, (farm) => farm.chainId)
  const allCampaigns = await Promise.all(
    Object.keys(groups).map((chainId) => {
      return fetchAllCampaignsByChainId({
        chainId: Number(chainId),
      })
    }),
  )

  const cakeAprCalls: SerializedFarmInfo[] = []
  // Infinity cake Apr
  for (const [i, farms] of Object.entries(groups)) {
    const campaigns = allCampaigns[i]
    for (const farm of farms) {
      if (isInfinityProtocol(farm.protocol)) {
        const cakeApr = getInfinityCakeAPR({
          chainId: Number(farm.chainId),
          poolId: farm.id,
          cakePrice,
          campaigns,
          tvlUSD: `${farm.tvlUSD}`,
        })
        // eslint-disable-next-line no-param-reassign
        farm.cakeApr = {
          value: cakeApr.value,
          cakePerYear: cakeApr.cakePerYear?.toString(),
          poolWeight: cakeApr.poolWeight?.toString(),
          userTvlUsd: cakeApr.userTvlUsd?.toString(),
        }
        continue
      }
      cakeAprCalls.push(farm)
    }
  }
  console.log(`cake price: ${cakePrice.toString()}`)
  // Other cake apr
  const results = await Promise.all(
    cakeAprCalls.map(async (farm) => {
      const tokens = getSerializedFarmTokens(farm)
      const pool = farmPropsToPoolInfoBase(farm, tokens[0], tokens[1]) as PoolInfo
      return getCakeApr(pool, cakePrice)
    }),
  )
  console.log(`num=${cakeAprCalls.length}`, `find:${results.length}`)
  results.forEach((cakeApr, index) => {
    const farm = cakeAprCalls[index]
    const key = `${farm.chainId}:${farm.id}`
    if (cakeApr[key]) {
      const apr = cakeApr[key] as CakeAprValue
      // eslint-disable-next-line no-param-reassign
      farm.cakeApr = {
        value: apr.value,
        cakePerYear: apr.cakePerYear?.toString(),
        boost: apr.boost,
        poolWeight: apr.poolWeight?.toString(),
        userTvlUsd: apr.userTvlUsd?.toString(),
        totalSupply: apr.totalSupply?.toString(),
      }
    }
  })
}

const getCakePriceFromOracle = async () => {
  const data = await getViemClients({ chainId: ChainId.BSC }).readContract({
    abi: chainlinkOracleABI,
    address: chainlinkOracleCAKE[ChainId.BSC],
    functionName: 'latestAnswer',
  })

  return formatUnits(data, 8)
}

export default {
  queryFarms,
  filterKeywords,
}
