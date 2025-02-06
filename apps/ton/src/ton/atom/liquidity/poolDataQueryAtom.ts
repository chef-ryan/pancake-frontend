import { QUERY_DEFAULT_STALE_TIME } from 'config/constants/exchange'
import { atomWithQuery } from 'jotai-tanstack-query'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { poolContractAtom } from '../contracts/poolContractAtom'
import { networkAtom } from '../networkAtom'
import { poolAddressAtom } from './poolAddressAtom'

interface PoolDataAtomParams {
  token0Address?: string
  token1Address?: string
}
export const poolDataQueryAtom = atomFamily(({ token0Address, token1Address }: PoolDataAtomParams) => {
  return atomWithQuery((get) => ({
    queryKey: ['poolData', get(networkAtom), token0Address, token1Address],
    queryFn: async () => {
      const poolAddress = await get(poolAddressAtom({ token0Address, token1Address }))
      if (!poolAddress) return null

      const pool = get(poolContractAtom(poolAddress.toString()))
      return pool.getGetPoolData()
    },
    enabled: !!token0Address && !!token1Address,
    staleTime: QUERY_DEFAULT_STALE_TIME, // 1 minute
    refetchInterval: QUERY_DEFAULT_STALE_TIME, // 1 minute
    retry: false,
  }))
}, isEqual)
