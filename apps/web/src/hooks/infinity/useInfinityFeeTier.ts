import { ChainId } from '@pancakeswap/chains'
import { Protocol } from '@pancakeswap/farms'
import { DYNAMIC_FEE_FLAG, HookData } from '@pancakeswap/infinity-sdk'
import { Percent } from '@pancakeswap/swap-sdk-core'
import { useMemo } from 'react'
import { calculateInfiFeePercent } from 'views/Swap/V3Swap/utils/exchange'

export type InfinityFeeTierPoolParams = {
  protocolFee: number
  fee: number
  poolType: 'Bin' | 'CL' | undefined
  dynamic?: boolean
  hookData?: HookData
}
export const useInfinityFeeTier = (pool: InfinityFeeTierPoolParams | null) => {
  return useMemo(() => {
    return getInfinityFeeTier(pool)
  }, [pool])
}

export type InfinityFeeTier = {
  protocol: 'Infinity LBAMM' | 'Infinity CLAMM'
  type: Protocol.InfinityBIN | Protocol.InfinityCLAMM
  percent: Percent
  lpFee: Percent
  protocolFee: Percent
  dynamic?: boolean
  hasPool: boolean
  hookData?: HookData
}

function getInfinityFeeTier(pool: InfinityFeeTierPoolParams | null): InfinityFeeTier {
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

export function getInfinityFeeTierForPool(chainId: ChainId, pool: InfinityFeeTierPoolParams) {
  const { fee, protocolFee, hookData, poolType } = pool
  const hookDefaultFee = hookData?.defaultFee
  const lpFee = hookDefaultFee ?? fee
  return getInfinityFeeTier({
    protocolFee: protocolFee ?? 0,
    fee: lpFee,
    poolType,
    dynamic: pool.fee === DYNAMIC_FEE_FLAG,
  })
}
