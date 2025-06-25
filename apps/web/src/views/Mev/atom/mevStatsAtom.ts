import { atomWithAsyncRetry } from 'utils/atomWithAsyncRetry'
import { fetchRPCData } from '../utils'

export const mevStatsAtom = atomWithAsyncRetry<{ txCount: number; walletCount: number }>({
  asyncFn: async () => {
    try {
      const [txCount, walletCount] = await Promise.all([fetchRPCData('stat_txCount'), fetchRPCData('stat_walletCount')])
      return { txCount, walletCount }
    } catch (error) {
      console.error('MEV stats fetch error', error)
      return { txCount: 0, walletCount: 0 }
    }
  },
  fallbackValue: { txCount: 0, walletCount: 0 },
})
