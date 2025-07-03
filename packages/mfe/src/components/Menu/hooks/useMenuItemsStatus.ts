import { useMemo } from 'react'
import { useTradingRewardStatus } from './useTradingRewardStatus'
import { useVotingStatus } from './useVotingStatus'

export const useMenuItemsStatus = (): Record<string, string> => {
  const votingStatus = useVotingStatus()
  const tradingRewardStatus = useTradingRewardStatus()

  return useMemo(() => {
    return {
      '/competition': '',
      ...(votingStatus && {
        '/voting': votingStatus,
      }),
      ...(tradingRewardStatus && {
        '/trading-reward': tradingRewardStatus,
      }),
    }
  }, [votingStatus, tradingRewardStatus])
}
