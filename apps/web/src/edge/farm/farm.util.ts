import { ChainId } from '@pancakeswap/chains'
import { Protocol } from '@pancakeswap/farms'
import { DYNAMIC_FEE_FLAG } from '@pancakeswap/infinity-sdk'
import { InfinityBinPool, InfinityClPool, Pool, SmartRouter } from '@pancakeswap/smart-router'
import { Currency } from '@pancakeswap/swap-sdk-core'
import { CakeAprValue } from 'state/farmsV4/atom'
import { BasePoolInfo, PoolInfo } from 'state/farmsV4/state/type'
import { Address } from 'viem/accounts'

export type FarmInfo = FarmProps & {
  pool: Pool
} & {
  cakeApr: CakeAprValue
}

type CakeAprItem = {
  value: `${number}`
  // boost apr
  boost?: `${number}`
  poolWeight?: string
  cakePerYear?: string
  userTvlUsd?: string
  totalSupply?: string
}

export type FarmProps = {
  id: Address
  chainId: ChainId
  lpApr: `${number}`
  merklApr: `${number}`
  // cakeApr: CakeAprValue
  feeTier: number
  vol24hUsd: number
  tvlUSD: number
  protocol: Protocol
  feeTierBase: number
  pid?: number
}

export type SerializedFarmInfo = FarmProps & {
  pool: SmartRouter.Transformer.SerializedPool
} & {
  cakeApr: CakeAprItem
}

export const getFarmTokens = (farm: FarmInfo): Currency[] => {
  const pool = farm.pool
  const currencies = SmartRouter.getCurrenciesOfPool(pool)
  return currencies
}

export const getSerializedFarmTokens = (farm: SerializedFarmInfo) => {
  const { pool: spool } = farm
  const pool = SmartRouter.Transformer.parsePool(farm.chainId, spool)
  return SmartRouter.getCurrenciesOfPool(pool)
}

export const isDynamic = (pool?: InfinityClPool | InfinityBinPool) => {
  if (!pool) return false
  return pool.fee === DYNAMIC_FEE_FLAG
}

export const farmPropsToPoolInfoBase = (farm: FarmProps, token0: Currency, token1: Currency): BasePoolInfo => {
  const base: BasePoolInfo = {
    chainId: farm.chainId,
    lpAddress: farm.id,
    protocol: farm.protocol,
    token0,
    token1: token1.asToken,
    lpApr: `${farm.lpApr}` as `${number}`,
    tvlUsd: `${farm.tvlUSD}` as `${number}`,
    vol24hUsd: `${farm.vol24hUsd}` as `${number}`,
    feeTier: farm.feeTier,
    feeTierBase: farm.feeTierBase,
    isFarming: false,
    isActiveFarm: false,
    pid: farm.pid,
  }
  return base
}

export const farmToPoolInfo = (farm: FarmInfo): PoolInfo => {
  const [token0, token1] = getFarmTokens(farm)
  const base = farmPropsToPoolInfoBase(farm, token0, token1)
  if (farm.protocol === Protocol.InfinityCLAMM || farm.protocol === Protocol.InfinityBIN) {
    const infinityPool = farm.pool as InfinityClPool | InfinityBinPool
    return {
      ...base,
      poolId: farm.id,
      hookAddress: infinityPool.hooks,
      dynamic: isDynamic(infinityPool),
    } as PoolInfo
  }

  return base as PoolInfo
}
