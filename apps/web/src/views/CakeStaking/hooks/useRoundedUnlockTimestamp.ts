import { MAX_VECAKE_LOCK_WEEKS, WEEK } from 'config/constants/veCake'
import dayjs from 'dayjs'
import { useLockCakeData } from 'state/vecake/hooks'
import { useMemo } from 'react'
import { useCurrentBlockTimestamp } from './useCurrentBlockTimestamp'

export const useRoundedUnlockTimestamp = (startTimestamp?: number): bigint | undefined => {
  const { cakeLockWeeks } = useLockCakeData()
  const currentTimestamp = useCurrentBlockTimestamp()

  const roundUnlockTimestamp = useMemo(() => {
    const week = Number(cakeLockWeeks) || 0

    const maxUnlockTimestamp = dayjs.unix(currentTimestamp).add(MAX_VECAKE_LOCK_WEEKS, 'weeks').unix()
    const userUnlockTimestamp = dayjs
      .unix(startTimestamp || currentTimestamp)
      .add(week, 'weeks')
      .unix()

    const unlockTimestamp = userUnlockTimestamp > maxUnlockTimestamp ? maxUnlockTimestamp : userUnlockTimestamp
    const flooredUnlockTimestamp = Math.floor(unlockTimestamp / WEEK) * WEEK

    if (!flooredUnlockTimestamp) {
      return undefined
    }

    return BigInt(flooredUnlockTimestamp)
  }, [cakeLockWeeks, startTimestamp, currentTimestamp])

  return roundUnlockTimestamp
}
