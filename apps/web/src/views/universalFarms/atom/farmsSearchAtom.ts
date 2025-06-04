import { isTestnetChainId } from '@pancakeswap/chains'
import { SmartRouter } from '@pancakeswap/smart-router'
import { Loadable } from '@pancakeswap/utils/Loadable'
import uniqBy from '@pancakeswap/utils/uniqBy'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import keyBy from 'lodash/keyBy'
import qs from 'qs'
import { atomWithLoadable } from 'quoter/atom/atomWithLoadable'
import { Protocol } from 'quoter/utils/edgeQueries.util'
import {
  batchGetCakeApr,
  batchGetLpAprData,
  batchGetMerklAprData,
  fillOnchainPoolData,
} from 'state/farmsV4/search/batchFarmDataFiller'
import { FarmQuery } from 'state/farmsV4/search/edgeFarmQueries'
import { FarmInfo, farmToPoolInfo, SerializedFarmInfo } from 'state/farmsV4/search/farm.util'
import { farmFilters } from 'state/farmsV4/search/filters'
import { PoolInfo } from 'state/farmsV4/state/type'
import { userShowTestnetAtom } from 'state/user/hooks/useUserShowTestnet'

async function fetchFarmList(extend: boolean, protocols?: Protocol[], address?: string) {
  const queryStr = qs.stringify({
    extend: extend ? 1 : undefined,
    protocols: protocols ? protocols.join(',') : undefined,
    address,
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

const hashProtocol = (protocols: Protocol[]) => {
  const list = [...protocols]
  list.sort()
  return list.join(',')
}
const extendListAtom = atomFamily(
  (params: { protocols: Protocol[]; address?: string }) => {
    const { protocols, address } = params
    return atomWithLoadable<SerializedFarmInfo[]>(async () => {
      return fetchFarmList(true, protocols, address)
    })
  },
  (a, b) => {
    return hashProtocol(a.protocols) === hashProtocol(b.protocols) && a.address === b.address
  },
)

export const farmsSearchPagingAtom = atomFamily((_: FarmQuery) => {
  return atom(0)
}, isEqual)

const IS_ADDRESS_REG = /^0x[a-fA-F0-9]{40,64}$/

const searchAtom = atomFamily((query: FarmQuery) => {
  return atom((get) => {
    const { protocols, chains: _chains, sortBy, activeChainId, keywords } = query
    const useShowTestnet = get(userShowTestnetAtom)
    const chains = _chains.filter((chain) => {
      if (isTestnetChainId(chain) && !useShowTestnet) {
        return false
      }
      return true
    })

    const lists = [
      get(farmListAtom),
      get(
        extendListAtom({
          protocols,
        }),
      ),
    ]
    if (IS_ADDRESS_REG.test(keywords.trim())) {
      lists.push(
        get(
          extendListAtom({
            protocols,
            address: keywords.trim(),
          }),
        ),
      )
    }

    const farms = uniqBy(
      lists
        .filter((x) => x.hasValue())
        .map((x) => x.unwrapOr([]))
        .flat(),
      (item) => `${item.chainId}:${item.id}`.toLowerCase(),
    ).map((farm) => {
      const { pool, chainId, vol24hUsd, ...rest } = farm
      const farmInfo = {
        chainId: farm.chainId,
        tvlUsd: 0,
        ...rest,
        feeTierBase: 1e6,
        vol24hUsd: farm.vol24hUsd,
        pool: SmartRouter.Transformer.parsePool(farm.chainId, farm.pool),
      } as FarmInfo

      return farmInfo
    })

    const filtered = farmFilters.search(
      farms.filter(farmFilters.chainFilter(chains)).filter(farmFilters.protocolFilter(protocols)),
      query.keywords,
    )
    const sorted = farmFilters.sortFunction(filtered, sortBy, activeChainId)

    const hasPending = lists.some((x) => x.isPending())

    if (hasPending) {
      return Loadable.Pending(sorted)
    }
    return Loadable.Just(sorted)
  })
}, isEqual)

const farmsWithPagingAtom = atomFamily((query) => {
  return atomWithLoadable(async (get) => {
    const sorted = get(searchAtom(query))
    const paging = get(farmsSearchPagingAtom(query))
    const r = await sorted.mapAsync(async (farms) => {
      const sliced = farms.slice(0, 20 * (paging + 1))

      const filled = await Promise.all(sliced.map(fillOnchainPoolData))
      return filled.map((x) => {
        return farmToPoolInfo(x)
      })
    })
    return r
  })
}, isEqual)

const farmsWithFilledDataAtom = atomFamily((query) => {
  return atomWithLoadable(
    async (get) => {
      const sliced = get(farmsWithPagingAtom(query))

      return sliced.mapAsync(async (poolInfos) => {
        const [cakeAprs, lpAprs, merklAprs] = await Promise.all([
          batchGetCakeApr(poolInfos),
          batchGetLpAprData(poolInfos),
          batchGetMerklAprData(poolInfos),
        ])

        const aggCakeAprs = keyBy(cakeAprs, (x) => x.id.toLowerCase())
        const aggLpAprs = keyBy(lpAprs, (x) => x.id.toLowerCase())
        const aggMerklAprs = keyBy(merklAprs, (x) => x.id.toLowerCase())

        return poolInfos.map((poolInfo) => {
          const { farm, ...others } = poolInfo
          const id = `${farm!.chainId}:${farm!.id}`.toLowerCase()
          const cakeApr = aggCakeAprs[id]?.value || '0'
          const lpApr = `${aggLpAprs[id]?.value || farm?.apr24h || '0'}`
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
    },
    {
      placeHolderBehavior: 'stale',
    },
  )
}, isEqual)

export const farmsSearchAtom = atomFamily((query) => {
  return atom((get) => {
    const sliced = get(farmsWithPagingAtom(query))
    const withFilledData = get(farmsWithFilledDataAtom(query))

    if (withFilledData.isPending()) {
      return sliced
    }
    return withFilledData
  })
}, isEqual)
