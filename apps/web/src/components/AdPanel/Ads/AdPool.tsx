import { BIG_ZERO } from '@pancakeswap/utils/bigNumber'
import BigNumber from 'bignumber.js'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { FC, useMemo } from 'react'
import { usePoolApr, usePoolInfo } from 'state/farmsV4/hooks'
import { PoolInfo } from 'state/farmsV4/state/type'

interface AdsPoolInfo {
  poolId: string
  title: string
  emoji: 'fire'
}

export const AdPool: FC = () => {
  const id = '0x172fcD41E0913e95784454622d1c3724f546f849'
  const { chainId } = useActiveChainId()

  const pool = usePoolInfo({
    chainId,
    poolAddress: id,
  })

  if (!pool) {
    return null
  }
  const key: `${number}:0x${string}` = `${pool.chainId}:${pool.lpAddress}`

  console.log('key-x', key)
  return (
    <div>
      Test
      <Apr poolKey={key} pool={pool} />
    </div>
  )
}

interface AprProps {
  poolKey: `${number}:0x${string}`
  pool: PoolInfo
}
const Apr = (props: AprProps) => {
  const { poolKey, pool } = props
  const { lpApr, cakeApr, merklApr } = usePoolApr(poolKey, pool)
  const numerator = useMemo(() => {
    const lpAprNumerator = new BigNumber(lpApr).times(cakeApr?.userTvlUsd ?? BIG_ZERO)
    return lpAprNumerator
  }, [lpApr, cakeApr?.userTvlUsd])
  const denominator = useMemo(() => {
    return cakeApr?.userTvlUsd ?? BIG_ZERO
  }, [cakeApr?.userTvlUsd])
  console.log({ lpApr })

  return <span>{lpApr}</span>
}
