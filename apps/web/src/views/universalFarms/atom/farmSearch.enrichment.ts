import { atom } from 'jotai'
import { atomFamily, unwrap } from 'jotai/utils'
import keyBy from 'lodash/keyBy'
import isEqual from 'lodash/isEqual'
import {
  batchGetCakeApr,
  batchGetIncentraAprData,
  batchGetLpAprData,
  batchGetMerklAprData,
} from 'state/farmsV4/search/batchFarmDataFiller'
import { FarmQuery } from 'state/farmsV4/search/edgeFarmQueries'
import { CakeAprValue } from 'state/farmsV4/atom'
import { farmsWithPagingAtom } from './farmSearch.search'

interface AprMaps {
  aggCakeAprs: Record<string, { id: string; value: CakeAprValue }>
  aggLpAprs: Record<string, { id: string; value: number }>
  aggMerklAprs: Record<string, { id: string; value: number }>
  aggIncentraAprs: Record<string, { id: string; value: number }>
}

export const farmsAprMapsAtom = atomFamily((_query: FarmQuery) => {
  return atom(async (get) => {
    const poolInfos = get(farmsWithPagingAtom(_query as any)).unwrapOr([])
    const [cakeAprs, lpAprs, merklAprs, incentraAprs] = await Promise.allSettled([
      batchGetCakeApr(poolInfos),
      batchGetLpAprData(poolInfos),
      batchGetMerklAprData(poolInfos),
      batchGetIncentraAprData(poolInfos),
    ])

    const result: AprMaps = {
      aggCakeAprs: keyBy(cakeAprs.status === 'fulfilled' ? cakeAprs.value : [], (x) => x.id),
      aggLpAprs: keyBy(lpAprs.status === 'fulfilled' ? lpAprs.value : [], (x) => x.id),
      aggMerklAprs: keyBy(merklAprs.status === 'fulfilled' ? merklAprs.value : [], (x) => x.id),
      aggIncentraAprs: keyBy(incentraAprs.status === 'fulfilled' ? incentraAprs.value : [], (x) => x.id),
    }
    return result
  })
}, isEqual)

// const cache = new Map<string, Loadable<AprMaps>>()
// export const farmsAprMapsAtom = atomFamily((_query: FarmQuery) => {
//   const phKey = getHashKey({ ..._query, page: 0 })
//   return atom((get) => {
//     const r = get(_farmsAprMapsAtom(_query))
//     if (r.isPending()) {
//       const ph = cache.get(phKey)
//       if (ph) {
//         return ph.unwrap()
//       }
//     }
//     if (r.isJust() && Object.keys(r.unwrap().aggLpAprs).length > 0) {
//       cache.set(phKey, r)
//     }
//     return r.unwrapOr({
//       aggCakeAprs: {},
//       aggLpAprs: {},
//       aggMerklAprs: {},
//       aggIncentraAprs: {},
//     } as AprMaps)
//   })
// }, isEqual)
