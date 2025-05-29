import { ChainId } from '@pancakeswap/chains'
import groupBy from 'lodash/groupBy'
import { publicClient } from 'utils/viem'
import { FarmInfo } from './farm.util'
import { poolInfoFillers } from './poolInfoFillers'

const cache = new Map<string, FarmInfo>()
export const fillFarmData = async (farms: FarmInfo[]) => {
  const group = groupBy(farms, (farm) => farm.chainId)
  const list = await Promise.all(
    Object.entries(group).map(([chainId, farms]) => {
      return fillFarmByChain(Number(chainId) as ChainId, farms)
    }),
  )
  return list.flat()
}

const cacheKey = (farm: FarmInfo) => `${farm.chainId}-${farm.id}`
const fillFarmByChain = async (chainId: ChainId, farms: FarmInfo[]) => {
  const tasks: {
    index: number
    range: number
    farm: FarmInfo
  }[] = []
  const list = farms.map((farm, i) => {
    const key = cacheKey(farm)
    if (cache.has(key)) {
      return cache.get(key)!
    }
    tasks.push({
      index: i,
      farm,
      range: 0,
    })
    return undefined // place holder
  })

  const calls = tasks
    .map((task) => {
      const farm = task.farm
      const getCallData = poolInfoFillers[farm.protocol].getCallData
      const _calls = getCallData(farm.id, farm.chainId)
      // eslint-disable-next-line no-param-reassign
      task.range = _calls.length
      return _calls
    })
    .flat()
  const client = publicClient({ chainId })
  const results = await client.multicall({
    contracts: calls,
    allowFailure: false,
  })

  let i = 0
  for (const task of tasks) {
    const { range } = task

    const resultsSlice = range > 0 ? results.slice(i, i + range) : []
    i += range
    const filler = poolInfoFillers[task.farm.protocol].filler
    filler(task.farm, resultsSlice)
    list[task.index] = task.farm
    cache.set(cacheKey(task.farm), task.farm)
  }
  return list as FarmInfo[]
}
