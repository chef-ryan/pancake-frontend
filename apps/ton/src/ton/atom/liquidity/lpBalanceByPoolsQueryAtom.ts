import { QUERY_MEDIUM_STALE_TIME } from 'config/constants/exchange'
import { atomWithQuery } from 'jotai-tanstack-query'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { parseAddress } from 'ton/utils/address'
import { addressAtom } from '../addressAtom'
import { lpWalletContractAtom } from '../contracts/lpWalletContractAtom'
import { poolContractAtom } from '../contracts/poolContractAtom'
import { networkAtom } from '../networkAtom'

export const lpBalanceByPoolsQueryAtom = atomFamily((poolAddresses: string[]) => {
  return atomWithQuery((get) => ({
    queryKey: ['lpBalanceByPoolsQueryAtom', get(networkAtom), poolAddresses, get(addressAtom)],
    queryFn: async () => {
      const userAddress = get(addressAtom)

      async function getLpBalance(poolAddress: string) {
        const pool = get(poolContractAtom(poolAddress))

        const lpWalletAddress = await pool.getGetWalletAddress(parseAddress(userAddress))
        const lpWallet = get(lpWalletContractAtom(lpWalletAddress.toString()))
        const balance = (await lpWallet.getGetWalletData()).balance ?? 0n

        return { poolAddress, balance }
      }

      return (await Promise.allSettled(poolAddresses.map(getLpBalance)))
        .filter(
          (result): result is PromiseFulfilledResult<{ poolAddress: string; balance: bigint }> =>
            result.status === 'fulfilled',
        )
        .map((result) => result.value)
    },
    enabled: !!poolAddresses && poolAddresses.length > 0 && !!get(addressAtom),
    refetchInterval: QUERY_MEDIUM_STALE_TIME,
    initialData: [],
    retry: 3,
  }))
}, isEqual)
