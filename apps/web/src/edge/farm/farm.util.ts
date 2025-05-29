import { ChainId } from '@pancakeswap/chains'
import { Protocol } from '@pancakeswap/farms'
import { DYNAMIC_FEE_FLAG } from '@pancakeswap/infinity-sdk'
import { InfinityBinPool, InfinityClPool, Pool, SmartRouter } from '@pancakeswap/smart-router'
import { Currency } from '@pancakeswap/swap-sdk-core'
import { PoolInfo } from 'state/farmsV4/state/type'
import { Address } from 'viem/accounts'

export type FarmInfo = {
  pool: Pool
  id: Address
  chainId: ChainId
  lpApr: number
  feeTier: number
  vol24hUsd: number
  tvlUsd: number
  protocol: Protocol
  feeTierBase: number
}

export type SerializedFarmInfo = {
  pool: SmartRouter.Transformer.SerializedPool
  id: Address
  chainId: ChainId
}

export const getFarmTokens = (farm: FarmInfo): Currency[] => {
  const pool = farm.pool
  const currencies = SmartRouter.getCurrenciesOfPool(pool)
  return currencies
}

export const isDynamic = (pool?: InfinityClPool | InfinityBinPool) => {
  if (!pool) return false
  return pool.fee === DYNAMIC_FEE_FLAG
}

export const farmToPoolInfo = (farm: FarmInfo): PoolInfo => {}
