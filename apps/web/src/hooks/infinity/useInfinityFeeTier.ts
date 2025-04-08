import { Protocol } from '@pancakeswap/farms'
import { BinPool, Pool } from '@pancakeswap/infinity-sdk'
import { Percent } from '@pancakeswap/swap-sdk-core'
import { useMemo } from 'react'

export const useInfinityFeeTier = (pool: Pool | BinPool | null) => {
  return useMemo(() => {
    return getInfinityFeeTier(pool)
  }, [pool])
}

function getInfinityFeeTier(
  pool: {
    protocolFee: number
    fee: number
    poolType: 'Bin' | 'CL' | undefined
    dynamic?: boolean
  } | null,
) {
  const { totalFee, lpFee, protocolFee } = calculateInfinityFeeTier(pool?.protocolFee ?? 0, pool?.fee ?? 0)

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

export function calculateInfinityFeeTier(protocolFee: number, lpFee: number) {
  const maskedProtocolFee = protocolFee & 0xfff
  const totalFee = (maskedProtocolFee + ((1e6 - maskedProtocolFee) * lpFee) / 1e6).toFixed(0)

  return {
    totalFee: Number(totalFee),
    lpFee,
    protocolFee: maskedProtocolFee,
  }
}
