import { QUERY_DEFAULT_STALE_TIME } from 'config/constants/exchange'
import { atomWithQuery } from 'jotai-tanstack-query'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { poolContractAtom } from '../contracts/poolContractAtom'
import { networkAtom } from '../networkAtom'

export const poolDataMultipleQueryAtom = atomFamily((poolAddresses: string[]) => {
  return atomWithQuery((get) => ({
    queryKey: ['poolDataMultiple', get(networkAtom), poolAddresses],
    queryFn: async () => {
      async function getPoolData(poolAddress: string) {
        const pool = get(poolContractAtom(poolAddress))
        return pool.getGetPoolData()
      }
      return Promise.all(poolAddresses.map(getPoolData))
    },
    enabled: !!poolAddresses,
    refetchInterval: QUERY_DEFAULT_STALE_TIME,
    retry: 1,
    initialData: [],
  }))
}, isEqual)
