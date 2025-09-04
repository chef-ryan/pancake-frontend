import { Protocol } from '@pancakeswap/farms'
import { HookData } from '@pancakeswap/infinity-sdk'
import { Currency, UnifiedCurrency } from '@pancakeswap/swap-sdk-core'
import { Address } from 'viem'
import { paths } from 'state/info/api/solSchema'
import { FarmInfo } from '../search/farm.util'

type Prettify<T> = {
  [K in keyof T]: T[K]
} & object

export type PoolInfo = Prettify<V2PoolInfo | StablePoolInfo | V3PoolInfo | InfinityPoolInfo>

export type UnifedPoolInfo = Prettify<V2PoolInfo | StablePoolInfo | V3PoolInfo | InfinityPoolInfo | SolV3PoolInfo>

export type BasePoolInfo = {
  pid?: number
  chainId: number
  lpAddress: Address
  stableSwapAddress?: Address
  protocol: Protocol
  token0: Currency
  token1: Currency
  token0Price?: `${number}`
  token1Price?: `${number}`
  tvlToken0?: `${number}`
  tvlToken1?: `${number}`
  lpApr?: `${number}`
  tvlUsd?: `${number}`
  tvlUsd24h?: `${number}`
  vol24hUsd?: `${number}`
  vol48hUsd?: `${number}`
  vol7dUsd?: `${number}`
  fee24hUsd?: `${number}`
  lpFee24hUsd?: `${number}`
  liquidity?: bigint
  feeTier: number
  feeTierBase: number
  totalFeeUSD?: `${number}`
  isFarming: boolean
  isActiveFarm?: boolean
  isDynamicFee?: boolean
  farm?: FarmInfo
}

type SolanaPoolResp =
  paths['/cached/v1/pools/info/ids']['get']['responses']['200']['content']['application/json']['data'][0]
export type SolV3PoolInfo = Omit<BasePoolInfo, 'token0' | 'token1'> & {
  protocol: Protocol.V3
  solanaData: SolanaPoolResp
  token0: UnifiedCurrency
  token1: UnifiedCurrency
}

export type V3PoolInfo = BasePoolInfo & {
  protocol: Protocol.V3
}

export type V2PoolInfo = BasePoolInfo & {
  protocol: Protocol.V2
  // V2 farming pools should have a bCakeWrapperAddress
  bCakeWrapperAddress?: Address
}

export type StablePoolInfo = BasePoolInfo & {
  protocol: Protocol.STABLE
  // Stable farming pools should have a bCakeWrapperAddress
  bCakeWrapperAddress?: Address
}

export type InfinityPoolInfo = InfinityBinPoolInfo | InfinityCLPoolInfo

type InfinityAdditionalPoolInfo = {
  /** @deprecated use poolId instead */
  lpAddress: string
  poolId: Address
  hookData?: HookData
  hookAddress?: Address
  dynamic?: boolean
}

export type InfinityBinPoolInfo = Prettify<
  BasePoolInfo &
    InfinityAdditionalPoolInfo & {
      protocol: Protocol.InfinityBIN
      feeAmount?: number
    }
>

export type InfinityCLPoolInfo = Prettify<
  BasePoolInfo &
    InfinityAdditionalPoolInfo & {
      protocol: Protocol.InfinityCLAMM
    }
>

export type ChainIdAddressKey = `${number}:${Address}`
