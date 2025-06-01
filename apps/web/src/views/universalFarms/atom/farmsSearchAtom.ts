import { PoolType, SmartRouter } from '@pancakeswap/smart-router'
import uniqBy from '@pancakeswap/utils/uniqBy'
import {
  batchGetCakeApr,
  batchGetLpAprData,
  batchGetMerklAprData,
  fillOnchainPoolData,
} from 'edge/farm/batchFarmDataFiller'
import { FarmQuery } from 'edge/farm/edgeFarmQueries'
import { FarmInfo, farmToPoolInfo, SerializedFarmInfo } from 'edge/farm/farm.util'
import { farmFilters } from 'edge/farm/filters'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import keyBy from 'lodash/keyBy'
import qs from 'qs'
import { atomWithLoadable } from 'quoter/atom/atomWithLoadable'
import { PoolInfo } from 'state/farmsV4/state/type'

const typeToProtocol = (type: PoolType) => {
  switch (type) {
    case PoolType.InfinityCL:
      return 'infinityCl'
    case PoolType.InfinityBIN:
      return 'infinityBin'
    case PoolType.V3:
      return 'v3'
    case PoolType.V2:
      return 'v2'
    case PoolType.STABLE:
      return 'stable'
    default:
      return 'Unknown'
  }
}

async function fetchFarmList(extend: boolean) {
  const queryStr = qs.stringify({
    extend: extend ? 1 : undefined,
  })
  const url = `/api/farm/list?${queryStr}`
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch farms: ${response.statusText}`)
  }
  const resp = (await response.json()) as {
    data: SerializedFarmInfo[]
    lastUpdated: number
  }
  return resp.data
}

const farmListAtom = atomWithLoadable<SerializedFarmInfo[]>(async () => {
  return fetchFarmList(false)
})

const extendListAtom = atomWithLoadable<SerializedFarmInfo[]>(async () => {
  return fetchFarmList(true)
})

export const farmsSearchPagingAtom = atomFamily((_: FarmQuery) => {
  return atom(0)
}, isEqual)

const searchAtom = atomFamily((query: FarmQuery) => {
  return atomWithLoadable(
    async (get) => {
      try {
        const { protocols, chains, sortBy } = query
        const lists = await Promise.all([get(farmListAtom), get(extendListAtom)])

        const farms = uniqBy(
          lists
            .filter((x) => x.isJust())
            .map((x) => x.unwrap())
            .flat(),
          (item) => `${item.chainId}:${item.id}`,
        ).map((farm) => {
          const farmInfo = {
            id: farm.id,
            chainId: farm.chainId,
            pid: farm.pid,
            pool: SmartRouter.Transformer.parsePool(farm.chainId, farm.pool),
            lpApr: farm.lpApr,
            apr24h: farm.apr24h,
            merklApr: '0',
            cakeApr: {
              value: '0', // Fill later
            },
            feeTier: farm.feeTier,
            tvlUSD: Number(farm.tvlUSD) || 0,
            vol24hUsd: Number(farm.vol24hUsd) || 0,
            tvlUsd: 0,
            feeTierBase: 1e6,
            protocol: typeToProtocol(farm.pool.type as PoolType),
            isDynamicFee: farm.isDynamicFee,
          } as FarmInfo

          return farmInfo
        })
        console.log(
          `[search]`,
          farms.filter((x) => x.protocol === 'infinityCl').map((x) => x.feeTier),
        )
        const filtered = farms
          .filter(farmFilters.chainFilter(chains))
          .filter(farmFilters.protocolFilter(protocols))
          .filter(farmFilters.searchFilter(query.keywords))
        const sorted = farmFilters.sortFunction(filtered, sortBy)
        return sorted
      } catch (ex) {
        console.error('Error fetching farms:', ex)
        throw ex
      }
    },
    {
      placeHolderBehavior: 'stale',
    },
  )
}, isEqual)

const farmsWithPagingAtom = atomFamily((query) => {
  return atomWithLoadable(async (get) => {
    const sorted = get(searchAtom(query))
    const paging = get(farmsSearchPagingAtom(query))
    return sorted.mapAsync(async (farms) => {
      const sliced = farms.slice(0, 20 * (paging + 1))
      await Promise.all(farms.map(fillOnchainPoolData))
      return sliced.map((x) => {
        return farmToPoolInfo(x)
      })
    })
  })
}, isEqual)

const farmsWithFilledDataAtom = atomFamily((query) => {
  return atomWithLoadable(async (get) => {
    const sliced = get(farmsWithPagingAtom(query))

    return sliced.mapAsync(async (poolInfos) => {
      const [cakeAprs, lpAprs, merklAprs] = await Promise.all([
        batchGetCakeApr(poolInfos),
        batchGetLpAprData(poolInfos),
        batchGetMerklAprData(poolInfos),
      ])

      const aggCakeAprs = keyBy(cakeAprs, 'id')
      const aggLpAprs = keyBy(lpAprs, 'id')
      const aggMerklAprs = keyBy(merklAprs, 'id')

      return poolInfos.map((poolInfo) => {
        const { farm, ...others } = poolInfo
        const id = `${farm!.chainId}:${farm!.id}`
        const cakeApr = aggCakeAprs[id]?.value || '0'
        const lpApr = aggLpAprs[id]?.value || '0'
        const merklApr = aggMerklAprs[id]?.value || '0'

        return {
          ...others,
          farm: {
            ...farm,
            cakeApr,
            lpApr,
            merklApr,
          },
          lpApr,
        } as PoolInfo
      })
    })
  })
}, isEqual)

export const farmsSearchAtom = atomFamily((query) => {
  return atom(async (get) => {
    const sliced = get(farmsWithPagingAtom(query))
    const withFilledData = get(farmsWithFilledDataAtom(query))

    if (withFilledData.isPending()) {
      return sliced
    }
    return withFilledData
  })
}, isEqual)
