import { PoolUtils } from '@pancakeswap/solana-core-sdk'
import { Price, UnifiedCurrency } from '@pancakeswap/swap-sdk-core'
import { SolanaV3PositionDetail } from 'state/farmsV4/state/accountPositions/type'
import { SolanaV3PoolInfo } from 'state/farmsV4/state/type'
import { SolanaV3Pool } from 'state/pools/solana'

export type GetAprPositionParameters = {
  poolInfo: SolanaV3Pool
  positionAccount: SolanaV3PositionDetail
  inRange?: boolean
}

export function getPositionAprCore({ poolInfo, positionAccount, inRange = true }: GetAprPositionParameters) {
  if (positionAccount.liquidity.isZero()) {
    return {
      fee: {
        apr: 0,
        percentInTotal: 0,
      },
      rewards: poolInfo.rewardDefaultInfos.map((i, idx) => ({
        apr: 0,
        percentInTotal: 0,
        mint: poolInfo.rewardDefaultInfos[idx].mint,
      })),
      apr: 0,
    }
  }

  if (!inRange) {
    return {
      fee: {
        apr: 0,
        percentInTotal: 0,
      },
      rewards: poolInfo.rewardDefaultInfos.map((i, idx) => ({
        apr: 0,
        percentInTotal: 0,
        mint: poolInfo.rewardDefaultInfos[idx].mint,
      })),
      apr: 0,
    }
  }

  const planCApr = PoolUtils.estimateAprsForPriceRangeMultiplier({
    poolInfo,
    aprType: 'day',
    positionTickLowerIndex: Math.min(positionAccount.tickLower, positionAccount.tickUpper),
    positionTickUpperIndex: Math.max(positionAccount.tickLower, positionAccount.tickUpper),
  })
  const slicedRewardApr = planCApr.rewardsApr.slice(0, poolInfo.rewardDefaultInfos.length)
  const total = [planCApr.feeApr, ...slicedRewardApr].reduce((a, b) => a + b, 0)
  return {
    fee: {
      apr: planCApr.feeApr,
      percentInTotal: (planCApr.feeApr / total) * 100,
    },
    rewards: slicedRewardApr.map((i, idx) => ({
      apr: i,
      percentInTotal: (i / total) * 100,
      mint: poolInfo.rewardDefaultInfos[idx].mint,
    })),
    apr: Number.isNaN(planCApr.apr) ? 0 : planCApr.apr,
  }
}
