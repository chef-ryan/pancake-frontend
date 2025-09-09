import { NonEVMChainId } from '@pancakeswap/chains'
import { Protocol } from '@pancakeswap/farms'
import { isSolWSol, SOL } from '@pancakeswap/sdk'
import { SPLToken } from '@pancakeswap/swap-sdk-core'
import type { paths } from 'state/info/api/solSchema'

type SolanaPoolInfoFromApi =
  paths['/cached/v1/pools/info/ids']['get']['responses']['200']['content']['application/json']['data'][0]

export const normalizeSolanaPoolInfo = (solanaPoolInfo?: SolanaPoolInfoFromApi) => {
  if (!solanaPoolInfo) return null
  const token0 = new SPLToken({ ...solanaPoolInfo.mintA, chainId: NonEVMChainId.SOLANA })
  const token1 = new SPLToken({ ...solanaPoolInfo.mintB, chainId: NonEVMChainId.SOLANA })

  return {
    chainId: NonEVMChainId.SOLANA,
    lpAddress: solanaPoolInfo.id as `0x${string}`,
    poolId: solanaPoolInfo.id,
    protocol: Protocol.V3 as const,
    token0: isSolWSol(token0) ? SOL : token0,
    token1: isSolWSol(token1) ? SOL : token1,
    token0Price: String(solanaPoolInfo.price) as `${number}`,
    token1Price: String(1 / solanaPoolInfo.price) as `${number}`,
    tvlToken0: String(solanaPoolInfo.mintAmountA) as `${number}`,
    tvlToken1: String(solanaPoolInfo.mintAmountB) as `${number}`,
    tvlUsd: String(solanaPoolInfo.tvl) as `${number}`,
    vol24hUsd: String(solanaPoolInfo.day.volume) as `${number}`,
    vol48hUsd: String(solanaPoolInfo.day.volume * 2) as `${number}`, // Approximate
    vol7dUsd: String(solanaPoolInfo.week.volume) as `${number}`,
    fee24hUsd: String(solanaPoolInfo.day.volumeFee) as `${number}`,
    lpFee24hUsd: String(solanaPoolInfo.day.volumeFee) as `${number}`,
    lpApr: String(solanaPoolInfo.day.apr) as `${number}`,
    feeTier: Math.round(solanaPoolInfo.feeRate * 1e6), // Convert to basis points
    feeTierBase: 1e6, // Base for percentage calculations
    isFarming: false,
    isDynamicFee: false,
    solanaData: solanaPoolInfo,
  }
}
