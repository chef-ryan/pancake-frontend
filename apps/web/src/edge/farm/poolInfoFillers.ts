import { ChainId } from '@pancakeswap/chains'
import { Protocol } from '@pancakeswap/farms'
import {
  BinPoolManagerAbi,
  CLPoolManagerAbi,
  decodePoolKey,
  DYNAMIC_FEE_FLAG,
  PoolKey,
  PoolType,
  Slot0,
} from '@pancakeswap/infinity-sdk'
import { zeroAddress } from '@pancakeswap/price-api-sdk'
import { InfinityBinPool, InfinityClPool, V3Pool } from '@pancakeswap/smart-router'
import { FeeAmount } from '@pancakeswap/v3-sdk'
import { getPoolManagerAddress } from 'utils/addressHelpers'
import { ContractFunctionReturnType, Prettify } from 'viem'
import { Address } from 'viem/accounts'
import { FarmInfo } from './farm.util'

const clPoolCalls = (poolId: Address, chainId: ChainId) => {
  const poolManagerAddress = getPoolManagerAddress('CL', chainId)
  const calls = [
    {
      address: poolManagerAddress,
      functionName: 'poolIdToPoolKey',
      abi: CLPoolManagerAbi,
      args: [poolId],
    },
    {
      address: poolManagerAddress,
      functionName: 'getSlot0',
      abi: CLPoolManagerAbi,
      args: [poolId],
    },
    {
      address: poolManagerAddress,
      functionName: 'getLiquidity',
      abi: CLPoolManagerAbi,
      args: [poolId],
    },
  ]
  return calls as any[]
}

type CLPoolCallsResult = [
  ContractFunctionReturnType<typeof CLPoolManagerAbi, 'view', 'poolIdToPoolKey'>,
  ContractFunctionReturnType<typeof CLPoolManagerAbi, 'view', 'getSlot0'>,
  ContractFunctionReturnType<typeof CLPoolManagerAbi, 'view', 'getLiquidity'>,
]

const clPoolFiller = (farm: FarmInfo, result: any) => {
  const [poolKey, slot0, liquidity] = result as CLPoolCallsResult
  const pool = farm.pool as InfinityClPool
  const parsedPoolKey = parsePoolKeyResult('CL', poolKey)
  const slot0Info = parseSlot0('CL', slot0)
  pool.fee = parsedPoolKey.fee
  pool.protocolFee = slot0Info.protocolFee
  pool.liquidity = liquidity
  pool.hooks = parsedPoolKey.hooks
  // eslint-disable-next-line no-param-reassign
  farm.feeTier = pool.fee
}

const binPoolCalls = (poolId: Address, chainId: ChainId) => {
  const poolManagerAddress = getPoolManagerAddress('Bin', chainId)
  const calls = [
    {
      address: poolManagerAddress,
      functionName: 'poolIdToPoolKey',
      abi: BinPoolManagerAbi,
      args: [poolId],
    },
    {
      address: poolManagerAddress,
      functionName: 'getSlot0',
      abi: BinPoolManagerAbi,
      args: [poolId],
    },
  ]
  return calls as any[]
}

type BinPoolCallsResult = [
  ContractFunctionReturnType<typeof BinPoolManagerAbi, 'view', 'poolIdToPoolKey'>,
  ContractFunctionReturnType<typeof BinPoolManagerAbi, 'view', 'getSlot0'>,
]

const binPoolFiller = (farm: FarmInfo, result: any) => {
  const newFarm = farm
  const [poolKey, slot0] = result as BinPoolCallsResult
  const pool = farm.pool as InfinityBinPool

  if (!isValidPoolKeyResult(poolKey)) throw new Error('Invalid pool key result')

  const parsedPoolKey = parsePoolKeyResult('Bin', poolKey)
  const slot0Info = parseSlot0('Bin', slot0)

  pool.fee = parsedPoolKey.fee
  pool.hooks = parsedPoolKey.hooks
  newFarm.feeTier = pool.fee
  pool.protocolFee = slot0Info.protocolFee
}

const parsePoolKeyResult = <
  TPoolType extends PoolType,
  TResult extends TPoolType extends 'CL'
    ? Prettify<ContractFunctionReturnType<typeof CLPoolManagerAbi, 'view', 'poolIdToPoolKey'>>
    : Prettify<ContractFunctionReturnType<typeof BinPoolManagerAbi, 'view', 'poolIdToPoolKey'>>,
>(
  poolType: TPoolType,
  result: TResult,
): PoolKey<TPoolType> => {
  const [currency0, currency1, hooks, poolManager, fee, parameters] = result

  return decodePoolKey(
    {
      currency0,
      currency1,
      hooks,
      poolManager,
      fee,
      parameters,
    },
    poolType,
  )
}

const parseSlot0 = <
  TPoolType extends PoolType,
  TSlot0 extends TPoolType extends 'CL'
    ? ContractFunctionReturnType<typeof CLPoolManagerAbi, 'view', 'getSlot0'>
    : ContractFunctionReturnType<typeof BinPoolManagerAbi, 'view', 'getSlot0'>,
>(
  poolType: TPoolType,
  slot0: TSlot0,
): Slot0<TPoolType> => {
  if (poolType === 'CL') {
    const [sqrtPriceX96, tick, protocolFee, lpFee] = slot0 as ContractFunctionReturnType<
      typeof CLPoolManagerAbi,
      'view',
      'getSlot0'
    >
    return {
      sqrtPriceX96,
      tick,
      protocolFee,
      lpFee,
    } as Slot0<TPoolType>
  }

  const [activeId, protocolFee, lpFee] = slot0 as ContractFunctionReturnType<
    typeof BinPoolManagerAbi,
    'view',
    'getSlot0'
  >
  return {
    activeId,
    protocolFee,
    lpFee,
    dynamic: lpFee === DYNAMIC_FEE_FLAG,
  } as Slot0<TPoolType>
}

const isValidPoolKeyResult = (
  result?: ContractFunctionReturnType<typeof CLPoolManagerAbi, 'view', 'poolIdToPoolKey'>,
) => result && result.length === 6 && result[3] !== zeroAddress

export type PoolInfoFiller = {
  getCallData: (poolId: Address, chainId: ChainId) => any[]
  filler: (farm: FarmInfo, result: any[]) => void
}

export const poolInfoFillers = {
  infinityCl: {
    getCallData: clPoolCalls,
    filler: clPoolFiller,
  },

  infinityBin: {
    getCallData: binPoolCalls,
    filler: binPoolFiller,
  },
  v2: {
    getCallData: () => [],
    filler: (farm: FarmInfo) => {
      const newFarm = farm
      newFarm.feeTier = FeeAmount.MEDIUM
    },
  },
  v3: {
    getCallData: () => [],
    filler: (farm: FarmInfo) => {
      const newFarm = farm
      const pool = farm.pool as V3Pool
      newFarm.feeTier = pool.fee
    },
  },
  stable: {
    getCallData: () => [],
    filler: () => {},
  },
} satisfies Record<Protocol, PoolInfoFiller>
