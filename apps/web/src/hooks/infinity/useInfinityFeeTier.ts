import { ChainId } from '@pancakeswap/chains'
import { Protocol } from '@pancakeswap/farms'
import { DYNAMIC_FEE_FLAG, findHook } from '@pancakeswap/infinity-sdk'
import { InfinityBinPool, InfinityClPool, PoolType } from '@pancakeswap/smart-router'
import { Percent } from '@pancakeswap/swap-sdk-core'
import { useMemo } from 'react'
import { calculateInfiFeePercent } from 'views/Swap/V3Swap/utils/exchange'

type PoolParams = {
  protocolFee: number
  fee: number
  poolType: 'Bin' | 'CL' | undefined
  dynamic?: boolean
}
export const useInfinityFeeTier = (pool: PoolParams | null) => {
  return useMemo(() => {
    return getInfinityFeeTier(pool)
  }, [pool])
}

function getInfinityFeeTier(pool: PoolParams | null) {
  const { totalFee, lpFee, protocolFee } = calculateInfiFeePercent(pool?.fee ?? 0, pool?.protocolFee)

  return {
    protocol: pool?.poolType === 'Bin' ? 'Infinity LBAMM' : 'Infinity CLAMM',
    type: pool?.poolType === 'Bin' ? Protocol.InfinityBIN : Protocol.InfinityCLAMM,
    percent: new Percent(totalFee, 1e6),
    lpFee: new Percent(lpFee, 1e6),
    protocolFee: new Percent(protocolFee, 1e6),
    dynamic: pool?.dynamic,
    hasPool: !!pool,
  }
}

export function getInfinityFeeTierForPool(chainId: ChainId, pool: InfinityClPool | InfinityBinPool) {
  const { fee, protocolFee } = pool
  const hook = pool.hooks
  const hookData = hook ? findHook(hook, chainId) : undefined
  const hookDefaultFee = hookData?.defaultFee
  const lpFee = hookDefaultFee ?? fee
  return getInfinityFeeTier({
    protocolFee: protocolFee ?? 0,
    fee: lpFee,
    poolType: pool.type === PoolType.InfinityCL ? 'CL' : 'Bin',
    dynamic: pool.fee === DYNAMIC_FEE_FLAG,
  })
}
