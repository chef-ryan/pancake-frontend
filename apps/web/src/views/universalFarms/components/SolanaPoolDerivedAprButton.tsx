import React, { useMemo } from 'react'
import BN from 'bn.js'
import { Text, useTooltip } from '@pancakeswap/uikit'
import type { SolanaV3PoolInfo } from 'state/farmsV4/state/type'
import { useSolanaOnchainClmmPool } from 'hooks/solana/useSolanaOnchainPool'
import { useBirdeyeTokenPrice } from 'hooks/solana/useBirdeyeTokenPrice'
import { AprKey, useClmmApr } from 'hooks/solana/useClmmApr'
import { useV3FormState } from 'views/AddLiquidityV3/formViews/V3FormView/form/reducer'
import { useSolanaDerivedInfo } from 'hooks/solana/useSolanaDerivedInfo'
import { AprTooltipContent } from './PoolAprButtonV3/AprTooltipContent'

export const SolanaPoolDerivedAprText: React.FC<{ pool: SolanaV3PoolInfo; fontSize?: string }> = ({
  pool,
  fontSize,
}) => {
  const { data: onchain } = useSolanaOnchainClmmPool(pool.poolId)

  // Derive ticks from current form state
  const formState = useV3FormState()
  const { ticks } = useSolanaDerivedInfo(pool.token0, pool.token1, pool.feeTier, pool.token0, undefined, formState)

  // Token + reward mints for price map
  const rewardMints = (onchain?.computePoolInfo?.rewardInfos || [])
    .map((ri: any) => ri?.tokenMint?.toBase58?.())
    .filter(Boolean) as string[]
  const mintA = pool?.rawPool?.mintA?.address
  const mintB = pool?.rawPool?.mintB?.address
  const { data: birdeyePrices } = useBirdeyeTokenPrice({ mintList: [mintA, mintB, ...rewardMints] })

  const tokenPrices = useMemo(() => {
    const rec: Record<string, { value: number }> = {}
    if (mintA && birdeyePrices?.[mintA]?.value !== undefined) rec[mintA] = { value: birdeyePrices[mintA].value }
    if (mintB && birdeyePrices?.[mintB]?.value !== undefined) rec[mintB] = { value: birdeyePrices[mintB].value }
    rewardMints?.forEach((m) => {
      if (m && birdeyePrices?.[m]?.value !== undefined) rec[m] = { value: birdeyePrices[m].value }
    })
    return rec
  }, [birdeyePrices, mintA, mintB, rewardMints])

  const aprData = useClmmApr({
    poolInfo: pool.rawPool,
    poolLiquidity: (onchain?.computePoolInfo?.liquidity as BN) ?? new BN(0),
    positionInfo: { tickLower: ticks?.LOWER, tickUpper: ticks?.UPPER, liquidity: new BN(1) },
    timeBasis: AprKey.Day,
    planType: 'D',
    tokenPrices,
  })

  const combinedApr = Number(aprData?.apr || 0)
  const feeApr = Number(aprData?.fee?.apr || 0)
  const display = useMemo(() => {
    return Number.isFinite(combinedApr) && combinedApr > 0
      ? `${combinedApr.toLocaleString(undefined, { maximumFractionDigits: 2 })}%`
      : '-'
  }, [combinedApr])

  const { tooltip, targetRef, tooltipVisible } = useTooltip(
    <AprTooltipContent combinedApr={combinedApr} lpFeeApr={feeApr} showDesc />,
  )

  return (
    <>
      <Text ref={targetRef as any} fontSize={fontSize ?? '24px'} bold>
        {display}
      </Text>
      {tooltipVisible && tooltip}
    </>
  )
}
