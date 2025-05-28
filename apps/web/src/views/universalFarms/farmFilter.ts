import { Protocol } from '@pancakeswap/farms'
import { SORT_ORDER } from '@pancakeswap/uikit'
import latinise from '@pancakeswap/utils/latinise'
import { getCurrencyAddress, toTokenValueByCurrency } from '@pancakeswap/widgets-internal'
import flatMap from 'lodash/flatMap'
import groupBy from 'lodash/groupBy'
import intersection from 'lodash/intersection'
import { useMemo } from 'react'
import { PoolSortBy } from 'state/farmsV4/state/extendPools/atom'
import type { PoolApr } from 'state/farmsV4/state/poolApr/atom'
import { getCombinedApr } from 'state/farmsV4/state/poolApr/utils'
import type { InfinityPoolInfo, PoolInfo } from 'state/farmsV4/state/type'
import { getHookByAddress } from 'utils/getHookByAddress'
import { isInfinityProtocol } from 'utils/protocols'

export interface FarmFilterOptions {
  poolList: PoolInfo[]
  selectedNetwork: number[]
  selectedTokens?: string[]
  selectedProtocols: Protocol[]
  features: string[]
  protocols: Protocol[]
  isSelectAllProtocols: boolean
  isSelectAllFeatures: boolean
  search: string
  sortField: PoolSortBy | null
  sortOrder: SORT_ORDER
  poolsApr: PoolApr
  orderedChainIds: number[]
  activeChainId: number
  othersChains: number[]
}

export const useFarmFilter = ({
  poolList,
  selectedNetwork,
  selectedTokens,
  selectedProtocols,
  features,
  protocols,
  isSelectAllProtocols,
  isSelectAllFeatures,
  search,
  sortField,
  sortOrder,
  poolsApr,
  orderedChainIds,
  activeChainId,
  othersChains,
}: FarmFilterOptions) => {
  const filteredData = useMemo(() => {
    return poolList.filter((farm) => {
      return (
        selectedNetwork.includes(farm.chainId) &&
        (!selectedTokens?.length ||
          selectedTokens?.find(
            (token) => token === toTokenValueByCurrency(farm.token0) || token === toTokenValueByCurrency(farm.token1),
          )) &&
        selectedProtocols.includes(farm.protocol) &&
        (isSelectAllProtocols || !protocols.length || protocols.includes(farm.protocol)) &&
        (isSelectAllFeatures ||
          !features.length ||
          (isInfinityProtocol(farm.protocol) &&
            (farm as InfinityPoolInfo).hookAddress &&
            intersection(features, getHookByAddress(farm.chainId, (farm as InfinityPoolInfo).hookAddress)?.category)
              .length))
      )
    })
  }, [
    poolList,
    selectedTokens,
    selectedNetwork,
    selectedProtocols,
    features,
    protocols,
    isSelectAllProtocols,
    isSelectAllFeatures,
  ])

  const searchedData = useMemo(() => {
    if (!search) return filteredData
    const q = latinise(search.toLowerCase())
    return filteredData.filter((farm) => {
      const tokenMatch = [farm.token0, farm.token1].some((t) => {
        const symbol = 'symbol' in t ? (t as any).symbol : t.wrapped.symbol
        const addr = getCurrencyAddress(t)
        return (
          (typeof symbol === 'string' && latinise(symbol.toLowerCase()).startsWith(q)) ||
          addr?.toLowerCase().startsWith(q)
        )
      })

      const protocolTag =
        farm.protocol === Protocol.InfinityCLAMM ? 'clamm' : farm.protocol === Protocol.InfinityBIN ? 'lbamm' : ''
      const protocolMatch = protocolTag.startsWith(q)

      const featuresMatch = isInfinityProtocol(farm.protocol)
        ? getHookByAddress(farm.chainId, (farm as InfinityPoolInfo).hookAddress)?.category?.some((c) =>
            c.toLowerCase().startsWith(q),
          )
        : false

      const poolId = (farm as InfinityPoolInfo).poolId
      const poolAddressMatch =
        farm.lpAddress.toLowerCase().startsWith(q) || (poolId ? poolId.toLowerCase().startsWith(q) : false)

      return tokenMatch || protocolMatch || featuresMatch || poolAddressMatch
    })
  }, [filteredData, search])

  const dataByChain = useMemo(() => {
    return groupBy(searchedData, 'chainId')
  }, [searchedData])

  const defaultSortedData = useMemo(() => {
    const activeFarms = flatMap(orderedChainIds, (chainId) =>
      dataByChain[chainId]?.filter((pool) => !!pool.isActiveFarm),
    )
    const inactiveFarmsOfActiveChain =
      dataByChain[activeChainId]
        ?.filter((pool) => !pool.isActiveFarm)
        .sort((a, b) =>
          'tvlUsd' in a && 'tvlUsd' in b && b.tvlUsd && a.tvlUsd ? Number(b.tvlUsd) - Number(a.tvlUsd) : 1,
        ) ?? []
    const inactiveFarmsOfOthers = flatMap(othersChains, (chainId) =>
      dataByChain[chainId]?.filter((pool) => !pool.isActiveFarm),
    ).sort((a, b) => ('tvlUsd' in a && 'tvlUsd' in b && b.tvlUsd && a.tvlUsd ? Number(b.tvlUsd) - Number(a.tvlUsd) : 1))

    return [...activeFarms, ...inactiveFarmsOfActiveChain, ...inactiveFarmsOfOthers].filter(Boolean)
  }, [orderedChainIds, activeChainId, othersChains, dataByChain])

  const sortedData = useMemo(() => {
    if (sortField === null || sortOrder === SORT_ORDER.NULL) {
      return defaultSortedData
    }
    return [...searchedData].sort((a, b) => {
      if (sortField === PoolSortBy.APR) {
        const aprOfA = getCombinedApr(poolsApr, a.chainId, a.lpAddress)
        const aprOfB = getCombinedApr(poolsApr, b.chainId, b.lpAddress)
        return sortOrder * aprOfA + -1 * sortOrder * aprOfB
      }
      return sortOrder * Number(a[sortField]) + -1 * sortOrder * Number(b[sortField])
    })
  }, [defaultSortedData, sortOrder, sortField, searchedData, poolsApr])

  return { filteredData, searchedData, dataByChain, sortedData }
}

export type FarmFilterResult = ReturnType<typeof useFarmFilter>
