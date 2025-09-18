import { atom } from 'jotai'
import { atomFamily, unwrap } from 'jotai/utils'
import keyBy from 'lodash/keyBy'
import {
  batchGetCakeApr,
  batchGetIncentraAprData,
  batchGetLpAprData,
  batchGetMerklAprData,
} from 'state/farmsV4/search/batchFarmDataFiller'
import { FarmQuery } from 'state/farmsV4/search/edgeFarmQueries'
import { getHashKey } from 'utils/hash'
import { CakeAprValue } from 'state/farmsV4/atom'
import { farmsWithPagingAtom } from './farmSearch.search'

interface AprMaps {
  aggCakeAprs: Record<string, { id: string; value: CakeAprValue }>
  aggLpAprs: Record<string, { id: string; value: number }>
  aggMerklAprs: Record<string, { id: string; value: number }>
  aggIncentraAprs: Record<string, { id: string; value: number }>
}
const placeHolderValue = new Map<string, AprMaps>()
const hashQuery = (query: FarmQuery) => getHashKey(query)

export const farmsAprMapsAtom = atomFamily(
  (_query: FarmQuery) => {
    return unwrap(
      atom(async (get) => {
        // always derive from farmsWithPagingAtom for *this query*
        // but since key is global, every query shares the same atom instance
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
        placeHolderValue.set(hashQuery({ ..._query, page: 0 }), result)
        return result
      }),
      (prev) => {
        const placeHolderHash = hashQuery({ ..._query, page: 0 })
        if (placeHolderValue.has(placeHolderHash)) {
          return placeHolderValue.get(placeHolderHash)!
        }
        if (!prev) {
          return {
            aggCakeAprs: {},
            aggLpAprs: {},
            aggMerklAprs: {},
            aggIncentraAprs: {},
          }
        }
        return prev
      },
    )
  },
  (a, b) => {
    return hashQuery(a) === hashQuery(b)
  },
)
