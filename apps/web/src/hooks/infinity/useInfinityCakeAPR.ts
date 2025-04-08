import { useAccount } from 'wagmi'
import { BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import BigNumber from 'bignumber.js'
import { SECONDS_PER_YEAR } from 'config'
import { useMemo } from 'react'
import { InfinityBinPositionDetail, InfinityCLPositionDetail } from 'state/farmsV4/state/accountPositions/type'
import { InfinityPoolInfo } from 'state/farmsV4/state/type'
import { Address } from 'viem/accounts'
import { useCampaignsByChainId } from './useCampaigns'
import { useFarmRewardsByPoolId } from './useFarmReward'

interface InfinityCakeAPRProps {
  chainId?: number
  poolId?: Address
  tvlUSD?: `${number}` | BigNumber
  cakePrice?: BigNumber
}

export const useInfinityCakeAPR = ({ chainId, poolId, tvlUSD, cakePrice }: InfinityCakeAPRProps) => {
  // just fetch all campaigns at once, avoid to fetch every pool
  const campaigns = useCampaignsByChainId({ chainId })
  return useMemo(() => {
    if (!tvlUSD || Number(tvlUSD) === 0 || !cakePrice || !poolId || !chainId) {
      return {
        value: '0' as `${number}`,
      }
    }
    const validCampaigns = campaigns?.filter(
      (c) => c?.duration && Number(c.duration) > 0 && c?.startTime && Number(c.startTime) * 1000 <= Date.now(),
    )

    const cakeRewardsPerYear = validCampaigns
      ?.filter((c) => (Number(c.startTime) + Number(c.duration)) * 1000 >= Date.now())
      .reduce((acc, campaign) => {
        const { totalRewardAmount, duration } = campaign
        return new BigNumber(totalRewardAmount).dividedBy(1e18).dividedBy(duration).times(SECONDS_PER_YEAR).plus(acc)
      }, new BigNumber(0))

    const poolCakeRewardsPerYear = validCampaigns
      ?.filter((c) => c.poolId === poolId)
      .filter((c) => (Number(c.startTime) + Number(c.duration)) * 1000 >= Date.now())
      .reduce((acc, campaign) => {
        const { totalRewardAmount, duration } = campaign
        return new BigNumber(totalRewardAmount).dividedBy(1e18).dividedBy(duration).times(SECONDS_PER_YEAR).plus(acc)
      }, new BigNumber(0))

    const APR = (poolCakeRewardsPerYear?.times(cakePrice).dividedBy(tvlUSD).toFixed(6) ?? '0') as `${number}`

    return {
      value: APR,
      cakePerYear: cakeRewardsPerYear,
      poolWeight: cakeRewardsPerYear ? poolCakeRewardsPerYear?.dividedBy(cakeRewardsPerYear) : BIG_ZERO,
      userTvlUsd: new BigNumber(tvlUSD),
    }
  }, [cakePrice, campaigns, chainId, poolId, tvlUSD])
}

type InfinityPositionCakeAPR<T extends InfinityCLPositionDetail | InfinityBinPositionDetail> = InfinityCakeAPRProps & {
  pool: InfinityPoolInfo
  position: T
}

export const useInfinityCLPositionCakeAPR = ({
  tvlUSD,
  cakePrice,
  position,
  pool,
}: InfinityPositionCakeAPR<InfinityCLPositionDetail>) => {
  const { chainId, poolId } = pool
  const { cakePerYear, poolWeight } = useInfinityCakeAPR({ chainId, poolId, tvlUSD, cakePrice })
  const { address } = useAccount()
  const rewardsPerEpoch = useFarmRewardsByPoolId({ chainId, address, poolId })

  return useMemo(() => {
    if (!cakePerYear || !tvlUSD) {
      return {
        value: '0' as `${number}`,
      }
    }

    const positionRewardPerEpoch = rewardsPerEpoch?.[position.tokenId.toString()]
    const rewardForPositionPerYear = positionRewardPerEpoch
      ? positionRewardPerEpoch
          .dividedBy(1e18)
          .times(3)
          .times(365)
          .times(cakePrice ?? 1)
      : new BigNumber(cakePerYear)
          .times(poolWeight ?? 0)
          .times(cakePrice ?? 1)
          .times(new BigNumber(position.liquidity.toString()).dividedBy(pool.liquidity?.toString() ?? 1))

    return {
      value: rewardForPositionPerYear.div(tvlUSD).toString() as `${number}`,
    }
  }, [
    position.tokenId,
    rewardsPerEpoch,
    cakePerYear,
    tvlUSD,
    position.liquidity,
    poolWeight,
    pool.liquidity,
    cakePrice,
  ])
}

export const useInfinityBinPositionCakeAPR = ({
  tvlUSD,
  cakePrice,
  position,
  pool,
}: InfinityPositionCakeAPR<InfinityBinPositionDetail>) => {
  const { chainId, poolId } = pool
  const activeTVLUsd = useMemo(() => {
    if (!tvlUSD || !position.liquidity || (!position.poolLiquidity && !pool.liquidity)) {
      return '0' as `${number}`
    }
    return new BigNumber(tvlUSD).times(
      new BigNumber(position.liquidity.toString()).dividedBy(
        (position.poolLiquidity ?? pool.liquidity ?? 1).toString(),
      ),
    )
  }, [position.poolLiquidity, position.liquidity, pool.liquidity, tvlUSD])

  const { cakePerYear, poolWeight } = useInfinityCakeAPR({ chainId, poolId, tvlUSD: activeTVLUsd, cakePrice })
  const { address } = useAccount()
  const rewardsPerEpoch = useFarmRewardsByPoolId({ chainId, address, poolId })

  return useMemo(() => {
    if (!cakePerYear || !tvlUSD) {
      return {
        value: '0' as `${number}`,
      }
    }

    const share = new BigNumber(position.liquidity.toString()).dividedBy(
      (position.poolLiquidity ?? pool.liquidity)?.toString() ?? 1,
    )

    const positionRewardPerEpoch = rewardsPerEpoch
      ? Object.values(rewardsPerEpoch).reduce((acc, r) => acc.plus(r), BIG_ZERO)
      : undefined

    const rewardForPositionPerYear = positionRewardPerEpoch
      ? positionRewardPerEpoch
          .dividedBy(1e18)
          .times(3)
          .times(365)
          .times(cakePrice ?? 1)
      : new BigNumber(cakePerYear)
          .times(poolWeight ?? 0)
          .times(cakePrice ?? 1)
          .times(share)

    return {
      value: rewardForPositionPerYear.div(tvlUSD).toString() as `${number}`,
    }
  }, [
    rewardsPerEpoch,
    cakePerYear,
    tvlUSD,
    position.liquidity,
    position.poolLiquidity,
    pool.liquidity,
    poolWeight,
    cakePrice,
  ])
}
