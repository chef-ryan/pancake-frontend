import { QUERY_MEDIUM_STALE_TIME } from 'config/constants/exchange'
import { atomWithQuery } from 'jotai-tanstack-query'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { getLpWalletAddress } from 'ton/utils/api'
import { addressAtom } from '../addressAtom'
import { chainIdAtom } from '../chainIdAtom'
import { lpWalletContractAtom } from '../contracts/lpWalletContractAtom'
import { networkAtom } from '../networkAtom'

export const lpBalanceByPoolsQueryAtom = atomFamily((poolAddresses: string[]) => {
  return atomWithQuery((get) => ({
    queryKey: ['lpBalanceByPoolsQueryAtom', get(networkAtom), poolAddresses, get(addressAtom)],
    queryFn: async () => {
      const userAddress = get(addressAtom)

      async function getLpBalance(poolAddress: string) {
        const lpWalletAddress = await getLpWalletAddress(get(chainIdAtom), userAddress, poolAddress)
        const lpWallet = get(lpWalletContractAtom(lpWalletAddress.toString()))
        const balance = (await lpWallet.getGetWalletData()).balance ?? 0n

        return { poolAddress, balance }
      }
      const data = await Promise.allSettled(poolAddresses.map(getLpBalance))
      return data.map((result, index) =>
        result.status === 'fulfilled' ? result.value : { poolAddress: poolAddresses[index], balance: 0n },
      )
    },
    enabled: !!poolAddresses && poolAddresses.length > 0 && !!get(addressAtom),
    refetchInterval: QUERY_MEDIUM_STALE_TIME,
    initialData: [],
    retry: 3,
  }))
}, isEqual)
