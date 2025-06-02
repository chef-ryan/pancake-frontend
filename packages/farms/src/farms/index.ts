import { ChainId } from '@pancakeswap/chains'
import set from 'lodash/set'
import { fetchUniversalFarms } from '../fetchUniversalFarms'
import { UniversalFarmConfig } from '../types'
import { getFarmConfigKey } from '../utils'
import { bscTestnetFarmConfig } from './bscTestnet'
import { polygonZkEVMTestnetFarmConfig } from './polygonZkEVMTestnet'
import { zkSyncTestnetFarmConfig } from './zkSyncTestnet'

const chainIds: ChainId[] = [
  ChainId.BSC_TESTNET,
  ChainId.BSC,
  ChainId.ETHEREUM,
  ChainId.POLYGON_ZKEVM,
  ChainId.ZKSYNC,
  ChainId.ARBITRUM_ONE,
  ChainId.LINEA,
  ChainId.BASE,
  ChainId.OPBNB,
]

export const fetchAllUniversalFarms = async (): Promise<UniversalFarmConfig[]> => {
  console.log(`[farm] fetch universal farm`)
  try {
    const farmPromises = chainIds.map((chainId) => fetchUniversalFarms(chainId))
    const allFarms = await Promise.all(farmPromises)
    const combinedFarms = allFarms.flat()

    console.log(`[farm] 02 finish fetch universal farm, total farms: ${combinedFarms.length}`)
    return combinedFarms
  } catch (error) {
    console.error('Failed to fetch universal farms:', error)
    return []
  }
}

export const fetchAllUniversalFarmsMap = async (): Promise<Record<string, UniversalFarmConfig>> => {
  try {
    const farmConfig = await fetchAllUniversalFarms()

    return farmConfig.reduce((acc, farm) => {
      const key = getFarmConfigKey(farm)
      set(acc, key, farm)
      return acc
    }, {} as Record<string, UniversalFarmConfig>)
  } catch (error) {
    console.error('Failed to fetch universal farms map:', error)
    return {}
  }
}

export const UNIVERSAL_FARMS_WITH_TESTNET: UniversalFarmConfig[] = [
  ...bscTestnetFarmConfig,
  ...polygonZkEVMTestnetFarmConfig,
  ...zkSyncTestnetFarmConfig,
]
