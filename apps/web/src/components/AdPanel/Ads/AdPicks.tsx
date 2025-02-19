import { useTranslation } from '@pancakeswap/localization'
import { Box, Link } from '@pancakeswap/uikit'
import { BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import BigNumber from 'bignumber.js'
import { getChainId } from 'config/chains'
import { atom, useAtomValue } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { useEffect, useMemo } from 'react'
import { usePoolApr, usePoolInfo } from 'state/farmsV4/hooks'
import type { PoolInfo } from 'state/farmsV4/state/type'
import { ChainIdAddressKey } from 'state/farmsV4/state/type'
import { useMyPositions } from 'views/PoolDetail/components/MyPositionsContext'
import { getPoolDetailPageLink } from 'views/universalFarms/components'
import { sumApr } from 'views/universalFarms/utils/sumApr'
import { AdTag } from '../AdTag'
import { BodyText } from '../BodyText'
import { AdCard } from '../Card'
import { PickBaseCoin } from '../PickBaseCoin'
import { AdTextConfig, PickConfig } from '../types'
import { AdTextRender } from './AdCommon'

const usePicksData = (poolId: `0x{string}`, chain: string) => {
  const chainId = getChainId(chain)!
  const pool = usePoolInfo({ poolAddress: poolId, chainId }) || null

  // Always call hooks, even if pool is null
  const key = useMemo<ChainIdAddressKey | null>(() => {
    return pool ? `${pool.chainId}:${pool.lpAddress}` : null
  }, [pool])

  const { lpApr, cakeApr, merklApr } = usePoolApr(key, pool, true)

  const numerator = useMemo(() => {
    if (!pool || !cakeApr) return new BigNumber(0) // Default value if pool or cakeApr is missing
    return new BigNumber(lpApr).times(cakeApr?.userTvlUsd ?? BIG_ZERO)
  }, [lpApr, cakeApr?.userTvlUsd, pool])

  const denominator = useMemo(() => {
    return cakeApr?.userTvlUsd ?? BIG_ZERO
  }, [cakeApr?.userTvlUsd])

  const { updateTotalApr } = useMyPositions()

  useEffect(() => {
    if (pool && key) {
      updateTotalApr(key, numerator, denominator)
    }
  }, [cakeApr, denominator, key, lpApr, merklApr, numerator, pool, updateTotalApr])

  if (!pool) {
    return null // Return null after all hooks are processed
  }

  const total = sumApr(lpApr, cakeApr.boost)
  const fee = pool.feeTier
  const tvl = pool.tvlUsd
  return {
    pickData: {
      apr: total,
      fee: Number(fee) / 10000,
      tvl,
      token0: pool.token0,
      token1: pool.token1,
    },
    pool,
  }
}

const poolLinkAtom = atomFamily(
  (pool?: PoolInfo) => {
    return atom(async () => {
      if (!pool) {
        return ''
      }
      return getPoolDetailPageLink(pool)
    })
  },
  (a, b) => (a && b ? a.lpAddress === b.lpAddress && a.chainId === b.chainId : a === b),
)

export const AdPicks = ({ config, index }: { config: PickConfig; index: number }) => {
  const { poolId, chain, token0, token1 } = config
  const { t } = useTranslation()
  const data = usePicksData(poolId, chain)
  const link = useAtomValue(poolLinkAtom(data?.pool))
  if (!data) {
    return null
  }

  const { pickData, pool } = data
  const { fee, apr, tvl } = pickData
  const texts: AdTextConfig[] = [
    {
      text: `${t('PANCAKE PICKS')} #${index + 1} 🔥`,
      subTitle: true,
    },
  ]
  const tvlAmt = formatCurrency(Number(tvl || '0'))
  return (
    <div
      style={{
        position: 'relative',
      }}
    >
      <PickBaseCoin
        chain={chain}
        id={`${index}-0`}
        color={token0.color}
        top="-9px"
        right="61px"
        tokenAddress={token0.address}
      />
      <PickBaseCoin
        chain={chain}
        id={`${index}-1`}
        color={token1.color}
        top="29px"
        right="9px"
        tokenAddress={token1.address}
      />
      <AdCard isExpanded style={{ padding: '16px' }} isDismissible={false}>
        <BodyText mb="0">
          {texts.map((textConfig, i) => {
            const key = `${textConfig.text}-${i}`
            return <AdTextRender key={key} config={textConfig} />
          })}
          <Link
            style={{
              marginTop: '14.5px',
              color: '#02919D',
            }}
            href={link}
          >
            {token0.symbol}/${token1.symbol}
          </Link>
        </BodyText>
        <Box
          display="flex"
          style={{
            marginTop: '14.5px',
          }}
        >
          <AdTag title="FEE TIER" value={`${fee}%`} index={0} />
          <AdTag title="APR" value={`${(100 * apr).toFixed(2)}%`} index={1} />
          <AdTag title="TVL" value={tvlAmt} index={2} />
        </Box>
      </AdCard>
    </div>
  )
}

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(2)}M`
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}k`
  }
  return amount.toString()
}
