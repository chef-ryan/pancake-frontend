import { QUERY_MEDIUM_STALE_TIME, QUERY_RETRY_DELAY } from 'config/constants/exchange'
import { atomWithQuery } from 'jotai-tanstack-query'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { parseAddress } from 'ton/utils/address'
import { addressAtom } from '../addressAtom'
import { lpAccountContractAtom } from '../contracts/lpAccountContractAtom'
import { poolContractAtom } from '../contracts/poolContractAtom'
import { networkAtom } from '../networkAtom'

export const lpAccountMultipleQueryAtom = atomFamily((poolAddresses: string[]) => {
  return atomWithQuery((get) => ({
    queryKey: ['lpAccountMultiple', get(networkAtom), poolAddresses],
    queryFn: async () => {
      async function getLpAccountData(poolAddress: string) {
        const userAddress = get(addressAtom)
        if (!poolAddress)
          return {
            amount0: 0n,
            amount1: 0n,
            poolAddress,
            userAddress,
            lpAccountAddress: '',
          }

        const pool = get(poolContractAtom(poolAddress))

        const lpAccountAddress = await pool.getGetLpAccountAddress(parseAddress(userAddress))
        const lpAccount = get(lpAccountContractAtom(lpAccountAddress.toString()))
        const data = await lpAccount.getGetLpAccountData()
        return {
          lpAccountAddress: lpAccountAddress.toString(),
          amount0: data.amount0 ?? 0n,
          amount1: data.amount1 ?? 0n,
          poolAddress: data.poolAddress,
          userAddress: data.userAddress,
        }
      }
      return Promise.all(poolAddresses.map(getLpAccountData))
    },
    enabled: !!poolAddresses && !!get(addressAtom),
    refetchInterval: QUERY_MEDIUM_STALE_TIME,
    retry: 1,
    retryDelay: QUERY_RETRY_DELAY,
    initialData: [],
  }))
}, isEqual)
