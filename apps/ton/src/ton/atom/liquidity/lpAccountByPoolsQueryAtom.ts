import { QUERY_MEDIUM_STALE_TIME } from 'config/constants/exchange'
import { atomWithQuery } from 'jotai-tanstack-query'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { parseAddress } from 'ton/utils/address'
import { addressAtom } from '../addressAtom'
import { lpAccountContractAtom } from '../contracts/lpAccountContractAtom'
import { poolContractAtom } from '../contracts/poolContractAtom'
import { networkAtom } from '../networkAtom'

export const lpAccountByPoolsAtom = atomFamily((poolAddresses: string[]) => {
  return atomWithQuery((get) => ({
    queryKey: ['lpAccountByPools', get(networkAtom), poolAddresses, get(addressAtom)],
    queryFn: async () => {
      const userAddress = get(addressAtom)
      if (!userAddress) return undefined

      async function getLpAccountData(poolAddress: string) {
        const pool = get(poolContractAtom(poolAddress))

        const lpAccountAddress = await pool.getGetLpAccountAddress(parseAddress(userAddress))
        const lpAccount = get(lpAccountContractAtom(lpAccountAddress.toString()))
        return (await lpAccount.getGetLpAccountData()) ?? undefined
      }

      return Promise.all(poolAddresses.map(getLpAccountData))
    },
    enabled: !!poolAddresses && poolAddresses.length > 0 && !!get(addressAtom),
    staleTime: QUERY_MEDIUM_STALE_TIME,
    refetchInterval: QUERY_MEDIUM_STALE_TIME,
    initialData: [],
  }))
}, isEqual)
