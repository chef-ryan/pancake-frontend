import { PoolType, SmartRouter } from '@pancakeswap/smart-router'
import BigNumber from 'bignumber.js'
import { FarmQuery } from 'edge/farm/edgeFarmQueries'
import { FarmInfo, farmToPoolInfo, SerializedFarmInfo } from 'edge/farm/farm.util'
import { fillFarmData } from 'edge/farm/fillFarmData'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import qs from 'qs'
import { atomWithLoadable } from 'quoter/atom/atomWithLoadable'

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
export const farmsSearchAtom = atomFamily((query: FarmQuery) => {
  return atomWithLoadable(async (get) => {
    try {
      const queryStr = qs.stringify(query)
      const url = `/api/pools/search?${queryStr}`
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
      const farms = resp.data.map((farm) => {
        const cakeApr = farm.cakeApr
          ? {
              value: farm.cakeApr.value as `${number}`,
              cakePerYear: BigNumber(farm.cakeApr.cakePerYear || '0'),
              poolWeight: BigNumber(farm.cakeApr.poolWeight || '0'),
            }
          : undefined
        const farmInfo = {
          id: farm.id,
          chainId: farm.chainId,
          pool: SmartRouter.Transformer.parsePool(farm.chainId, farm.pool),
          lpApr: farm.lpApr,
          merklApr: '0',
          cakeApr,
          feeTier: 10,
          tvlUSD: Number(farm.tvlUSD) || 0,
          vol24hUsd: Number(farm.vol24hUsd) || 0,
          tvlUsd: 0,
          feeTierBase: 1e6,
          protocol: typeToProtocol(farm.pool.type as PoolType),
        } as FarmInfo

        // Compatibility with old farm data

        farmInfo.poolInfo = farmToPoolInfo(farmInfo)
        return farmInfo
      })

      const filtered = farms.slice(0, 20)
      const filled = await fillFarmData(filtered)
      console.log(`[farms]`, filled)

      return filled
    } catch (ex) {
      console.error('Error fetching farms:', ex)
      throw ex
    }
  })
}, isEqual)
