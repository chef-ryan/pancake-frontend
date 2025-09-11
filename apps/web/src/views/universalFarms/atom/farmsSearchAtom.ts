import { isTestnetChainId } from '@pancakeswap/chains'
import { SmartRouter } from '@pancakeswap/smart-router'
import { Loadable } from '@pancakeswap/utils/Loadable'
import uniqBy from '@pancakeswap/utils/uniqBy'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import keyBy from 'lodash/keyBy'
import { atomWithLoadable } from 'quoter/atom/atomWithLoadable'
import {
  batchGetCakeApr,
  batchGetLpAprData,
  batchGetMerklAprData,
  fillOnchainPoolData,
} from 'state/farmsV4/search/batchFarmDataFiller'
import { FarmQuery } from 'state/farmsV4/search/edgeFarmQueries'
import { FarmInfo, farmToPoolInfo, getFarmKey, SerializedFarmInfo } from 'state/farmsV4/search/farm.util'
import { farmFilters } from 'state/farmsV4/search/filters'
import { PoolInfo } from 'state/farmsV4/state/type'
import { userShowTestnetAtom } from 'state/user/hooks/useUserShowTestnet'
import { FarmV4SupportedChainId } from '@pancakeswap/farms'
import { tokensMapAtom } from './tokensMapAtom'
import { baseFarmListAtom, extendFarmListAtom } from './farmSearch.fetch'
import { filterTokens, isInWhitelist } from './farmSearch.filter'
import { parseExtendSearchParams } from './farmSearch.parser'

export const farmsSearchPagingAtom = atomFamily((_: FarmQuery) => {
  return atom(0)
}, isEqual)

const searchAtom = atomFamily((query: FarmQuery) => {
  return atom((get) => {
    const { protocols, chains: _chains, sortBy, activeChainId, keywords } = query
    const useShowTestnet = get(userShowTestnetAtom)
    const { tokensMap, symbolsMap } = get(tokensMapAtom)
    const queryChains = _chains.filter((chain) => {
      if (isTestnetChainId(chain) && !useShowTestnet) {
        return false
      }
      return true
    })
    if (queryChains.length === 0 && activeChainId) {
      queryChains.push(activeChainId)
    }

    const extendSearchList = parseExtendSearchParams(keywords, protocols, queryChains, symbolsMap)

    const baseList = [
      get(
        baseFarmListAtom({
          protocols,
          chains: queryChains as FarmV4SupportedChainId[],
        }),
      ),
    ]
    const extendList = extendSearchList.map((params) => get(extendFarmListAtom(params)))
    const lists = [...baseList, ...extendList]

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
      farms.filter(farmFilters.chainFilter(queryChains)).filter(farmFilters.protocolFilter(protocols)),
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
        const [cakeAprs, lpAprs, merklAprs] = await Promise.allSettled([
          batchGetCakeApr(poolInfos),
          batchGetLpAprData(poolInfos),
          batchGetMerklAprData(poolInfos),
        ])

        const aggCakeAprs = keyBy(cakeAprs.status === 'fulfilled' ? cakeAprs.value : [], (x) => x.id.toLowerCase())
        const aggLpAprs = keyBy(lpAprs.status === 'fulfilled' ? lpAprs.value : [], (x) => x.id.toLowerCase())
        const aggMerklAprs = keyBy(merklAprs.status === 'fulfilled' ? merklAprs.value : [], (x) => x.id.toLowerCase())

        return poolInfos.map((poolInfo) => {
          const { farm, ...others } = poolInfo
          const id = getFarmKey(farm!)
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
    const checkWhitelist = isInWhitelist(get(tokensMapAtom).tokensMap)

    const resultList = withFilledData.isPending() ? sliced : withFilledData

    return resultList.map((list) => {
      for (const pool of list) {
        const whitelisted = checkWhitelist(pool.farm!)
        pool.farm!.inWhitelist = whitelisted
      }
      const whiteListFarms = list.filter((pool) => pool.farm?.inWhitelist)
      const nonWhiteListFarms = list.filter((pool) => !pool.farm?.inWhitelist)
      if (whiteListFarms.length > 0) {
        return whiteListFarms
      }
      return nonWhiteListFarms
    })
  })
}, isEqual)
