import { isSolana } from '@pancakeswap/chains'
import { TICK_SPACINGS } from '@pancakeswap/v3-sdk'
import { PoolInfo, SolV3PoolInfo } from 'state/farmsV4/state/type'

export const getTickSpacing = (poolInfo: PoolInfo) => {
  return isSolana(poolInfo.chainId)
    ? (poolInfo as SolV3PoolInfo).solanaData.config.tickSpacing
    : TICK_SPACINGS[poolInfo.feeTier]
}
