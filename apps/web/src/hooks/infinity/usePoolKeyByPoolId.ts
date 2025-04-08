import {
  BinPoolManagerAbi,
  CLPoolManagerAbi,
  INFINITY_SUPPORTED_CHAINS,
  INFI_BIN_POOL_MANAGER_ADDRESSES,
  INFI_CL_POOL_MANAGER_ADDRESSES,
  POOL_TYPE,
  PoolType,
  decodeBinPoolParameters,
  decodeCLPoolParameters,
  type InfinitySupportedChains,
  type PoolKey,
} from '@pancakeswap/infinity-sdk'
import { useQuery } from '@tanstack/react-query'
import { publicClient } from 'utils/viem'
import { zeroAddress, type Address, type Hex } from 'viem'

export const parsePoolKey = <T extends PoolType>(
  poolType: T,
  currency0: Address,
  currency1: Address,
  hooks: Address,
  poolManager: Address,
  fee: number,
  parameters: Address,
) => {
  return {
    currency0,
    currency1,
    hooks,
    poolManager,
    fee,
    parameters: poolType === POOL_TYPE.CLAMM ? decodeCLPoolParameters(parameters) : decodeBinPoolParameters(parameters),
  } as PoolKey<T>
}

export const cLPoolIdToPoolKey = async (poolId: Hex, chainId: number) => {
  if (!chainId || !INFINITY_SUPPORTED_CHAINS.includes(chainId)) return undefined

  const client = publicClient({ chainId })
  if (!client) return undefined

  const clPoolKey = await client.readContract({
    address: INFI_CL_POOL_MANAGER_ADDRESSES[chainId as InfinitySupportedChains],
    functionName: 'poolIdToPoolKey',
    abi: CLPoolManagerAbi,
    args: [poolId],
  })

  const clPoolManager = clPoolKey?.[3]

  if (clPoolManager && clPoolManager !== zeroAddress) {
    return parsePoolKey(POOL_TYPE.CLAMM, ...clPoolKey)
  }
  return undefined
}

export const binPoolIdToPoolKey = async (poolId: Hex, chainId: number) => {
  if (!chainId || !INFINITY_SUPPORTED_CHAINS.includes(chainId)) return undefined

  const client = publicClient({ chainId })
  if (!client) return undefined

  const binPoolKey = await client.readContract({
    address: INFI_BIN_POOL_MANAGER_ADDRESSES[chainId as InfinitySupportedChains],
    functionName: 'poolIdToPoolKey',
    abi: BinPoolManagerAbi,
    args: [poolId],
  })

  const binPoolManager = binPoolKey?.[3]

  if (binPoolManager && binPoolManager !== zeroAddress) {
    return parsePoolKey(POOL_TYPE.Bin, ...binPoolKey)
  }
  return undefined
}

export const poolIdToPoolKey = async (poolId: Hex, chainId: number) => {
  if (!chainId || !INFINITY_SUPPORTED_CHAINS.includes(chainId)) return null

  const client = publicClient({ chainId })
  if (!client) return null

  const [{ result: clPoolKey }, { result: binPoolKey }] = await client.multicall({
    contracts: [
      {
        address: INFI_CL_POOL_MANAGER_ADDRESSES[chainId as InfinitySupportedChains],
        functionName: 'poolIdToPoolKey',
        abi: CLPoolManagerAbi,
        args: [poolId],
      },
      {
        address: INFI_BIN_POOL_MANAGER_ADDRESSES[chainId as InfinitySupportedChains],
        functionName: 'poolIdToPoolKey',
        abi: BinPoolManagerAbi,
        args: [poolId],
      },
    ],
  })

  const clPoolManager = clPoolKey?.[3]
  const binPoolManager = binPoolKey?.[3]

  if (clPoolManager && clPoolManager !== zeroAddress) {
    return parsePoolKey(POOL_TYPE.CLAMM, ...clPoolKey) satisfies PoolKey<'CL'>
  }
  if (binPoolManager && binPoolManager !== zeroAddress) {
    return parsePoolKey(POOL_TYPE.Bin, ...binPoolKey) satisfies PoolKey<'Bin'>
  }
  return null
}

export const usePoolKeyByPoolId = (poolId: Hex | undefined, chainId: number | undefined) => {
  return useQuery({
    queryKey: ['poolKeyByPoolId', chainId, poolId],
    queryFn: () => poolIdToPoolKey(poolId as Hex, chainId as number),
    enabled: !!chainId && !!poolId,
  })
}
