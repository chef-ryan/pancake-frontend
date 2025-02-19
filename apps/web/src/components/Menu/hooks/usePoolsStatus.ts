import { useQuery } from '@tanstack/react-query'
import { fetchPoolsTimeLimits } from '@pancakeswap/pools'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { getViemClients } from 'utils/viem'
import { useCurrentBlockTimestamp as useBlockTimestamp } from 'state/block/hooks'
import dayjs from 'dayjs'

export const usePoolsStatus = () => {
  const { chainId } = useActiveChainId()
  const currentTimestamp = useBlockTimestamp()

  const { data } = useQuery({
    queryKey: ['poolsStatus', chainId],
    queryFn: async () => {
      if (!chainId || !currentTimestamp) return undefined

      const livePools = await fetchPoolsTimeLimits(chainId, getViemClients)
      const hasRecentPool = livePools?.some((livePool) => {
        const timeDiff = dayjs.unix(currentTimestamp).diff(dayjs.unix(livePool.startTimestamp), 'day', true)
        return timeDiff <= 3
      })

      return hasRecentPool ? 'new_pool' : undefined
    },
    enabled: Boolean(chainId && currentTimestamp),
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  })

  return data
}
