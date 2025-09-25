import { atom } from 'jotai'
import { atomFamily, unwrap } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { atomWithLoadable } from 'quoter/atom/atomWithLoadable'

import { getFarmKey } from 'state/farmsV4/search/farm.util'
import { PoolInfo } from 'state/farmsV4/state/type'
import { FarmQuery } from 'state/farmsV4/search/edgeFarmQueries'
import { getHashKey } from 'utils/hash'
import { Loadable } from '@pancakeswap/utils/Loadable'
import { tokensMapAtom } from './tokensMapAtom'
import { farmFilters, isInWhitelist } from './farmSearch.filter'
import { farmsWithPagingAtom } from './farmSearch.search'
import { farmsAprMapsAtom } from './farmSearch.enrichment'

const farmsWithFilledDataAtom = atomFamily((query: FarmQuery) => {
  return atomWithLoadable(
    async (get) => {
      const { page } = query
      const sliced = get(farmsWithPagingAtom(query))
      const enrichment = await get(
        farmsAprMapsAtom({
          ...query,
          page,
        }),
      )

      return sliced.mapAsync(async (poolInfos) => {
        const { aggCakeAprs, aggLpAprs, aggMerklAprs, aggIncentraAprs } = enrichment
        const pools = poolInfos.map((poolInfo) => {
          const { farm, ...others } = poolInfo
          const id = getFarmKey(farm!)
          const cakeApr = aggCakeAprs[id]?.value || '0'
          const lpApr = `${aggLpAprs[id]?.value || farm?.apr24h || '0'}`
          const merklApr = aggMerklAprs[id]?.value || '0'
          const incentraApr = aggIncentraAprs[id]?.value || '0'

          return {
            ...others,
            farm: {
              ...farm,
              cakeApr,
              lpApr,
              merklApr,
              incentraApr,
            },
            lpApr,
          } as PoolInfo
        })
        return farmFilters.sortFunction(pools, query.sortBy, query.activeChainId, query.sortOrder)
      })
    },
    {
      placeHolderBehavior: 'stale',
    },
  )
}, isEqual)

type FarmQueryResult = {
  list: Loadable<PoolInfo[]>
  isLoading: boolean
}

const _farmsSearchV2Atom = atomFamily((query: FarmQuery) => {
  return atom((get) => {
    const withFilledData = get(farmsWithFilledDataAtom(query))
    const checkWhitelist = isInWhitelist(get(tokensMapAtom).tokensMap)

    const anyPending = withFilledData.isPending()
    const resultList: Loadable<PoolInfo[]> = withFilledData

    return {
      list: resultList.map((list) => {
        for (const pool of list) {
          if (pool.farm) {
            pool.farm.inWhitelist = checkWhitelist(pool.farm)
          }
        }
        return list
      }),
      isLoading: anyPending,
    } as FarmQueryResult
  })
}, isEqual)

const cache = new Map<string, FarmQueryResult>()
export const farmsSearchV2Atom = atomFamily((query: FarmQuery) => {
  const phKey = getHashKey({ ...query, page: 0 })
  return atom((get) => {
    const r = get(_farmsSearchV2Atom(query))
    if (r.list.isPending()) {
      if (cache.has(phKey)) {
        const val = cache.get(phKey)!
        return {
          ...val,
          isLoading: true,
        }
      }
    }
    if (r.list.isJust() && r.list.unwrap().length > 0) {
      cache.set(phKey, r)
    }
    return r
  })
}, isEqual)
