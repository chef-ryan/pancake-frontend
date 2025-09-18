import { isTestnetChainId } from '@pancakeswap/chains'
import { Loadable } from '@pancakeswap/utils/Loadable'
import uniqBy from '@pancakeswap/utils/uniqBy'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { atomWithLoadable } from 'quoter/atom/atomWithLoadable'
import { fillOnchainPoolData } from 'state/farmsV4/search/batchFarmDataFiller'
import { FarmQuery } from 'state/farmsV4/search/edgeFarmQueries'
import { FarmInfo, farmToPoolInfo, getFarmKey } from 'state/farmsV4/search/farm.util'
import { farmFilters } from 'state/farmsV4/search/filters'
import { userShowTestnetAtom } from 'state/user/hooks/useUserShowTestnet'
import { FarmV4SupportedChainId } from '@pancakeswap/farms'
import { tokensMapAtom } from './tokensMapAtom'
import { baseFarmListAtom, extendFarmListAtom } from './farmSearch.fetch'
import { filterTokens, isInWhitelist } from './farmSearch.filter'
import { parseExtendSearchParams } from './farmSearch.parser'

const searchAtom = atomFamily((query: FarmQuery) => {
  return atom((get) => {
    const { protocols, chains: _chains, sortBy, activeChainId, keywords } = query
    const useShowTestnet = get(userShowTestnetAtom)
    const { tokensMap } = get(tokensMapAtom)
    const queryChains = _chains.filter((chain) => {
      if (isTestnetChainId(chain) && !useShowTestnet) {
        return false
      }
      return true
    })
    if (queryChains.length === 0 && activeChainId) {
      queryChains.push(activeChainId as FarmV4SupportedChainId)
    }

    const extendSearchList = parseExtendSearchParams(keywords, protocols, queryChains)

    const baseList = get(
      baseFarmListAtom({
        protocols,
        chains: queryChains,
      }),
    )

    const extendList = extendSearchList.map((params) => get(extendFarmListAtom(params)))
    const lists = [baseList, ...extendList]

    function buildFarmList(list: FarmInfo[]) {
      return list.map((farm) => {
        const { pool, chainId, vol24hUsd, ...rest } = farm
        const farmInfo = {
          chainId: farm.chainId,
          tvlUsd: 0,
          ...rest,
          feeTierBase: 1e6,
          vol24hUsd: farm.vol24hUsd,
          pool,
        } as FarmInfo

        return farmInfo
      })
    }

    /* Pancake List , top-tvl farms */
    const baseResults = baseList
      .map((list) => buildFarmList(list))
      .unwrapOr([])
      .filter(filterTokens(tokensMap))

    /* trigger by extend search */
    const extendResults = extendList.map((list) => list.map((x) => buildFarmList(x)).unwrapOr([])).flat()

    const fullList = uniqBy([...baseResults, ...extendResults], (x) => getFarmKey(x))

    const filtered = farmFilters.search(
      fullList.filter(farmFilters.chainFilter(queryChains)).filter(farmFilters.protocolFilter(protocols)),
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

export const farmsWithPagingAtom = atomFamily((query: FarmQuery) => {
  return atomWithLoadable(async (get) => {
    const { page } = query
    const sorted = get(searchAtom(query))
    const r = await sorted.mapAsync(async (farms) => {
      const sliced = farms.slice(0, 20 * (page + 1))

      const filled = await Promise.all(sliced.map(fillOnchainPoolData))
      return filled.map((x) => {
        return farmToPoolInfo(x)
      })
    })
    return r
  })
}, isEqual)
