import { QUERY_DEFAULT_STALE_TIME } from 'config/constants/exchange'
import { atomWithQuery } from 'jotai-tanstack-query'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { parseAddress } from 'ton/utils/address'
import { addressAtom } from '../addressAtom'
import { lpAccountContractAtom } from '../contracts/lpAccountContractAtom'
import { poolContractAtom } from '../contracts/poolContractAtom'
import { networkAtom } from '../networkAtom'
import { poolAddressAtom } from './poolAddressAtom'

interface LpAccountQueryAtomProps {
  token0Address?: string
  token1Address?: string
}

export const lpAccountQueryAtom = atomFamily(({ token0Address, token1Address }: LpAccountQueryAtomProps) => {
  return atomWithQuery((get) => ({
    queryKey: ['lpAccount', get(networkAtom), token0Address, token1Address, get(addressAtom)],
    queryFn: async () => {
      const userAddress = get(addressAtom)

      const poolAddress = await get(poolAddressAtom({ token0Address, token1Address }))
      if (!poolAddress)
        return {
          amount0: 0n,
          amount1: 0n,
        }

      const pool = get(poolContractAtom(poolAddress))

      const lpAccountAddress = await pool.getGetLpAccountAddress(parseAddress(userAddress))
      const lpAccount = get(lpAccountContractAtom(lpAccountAddress.toString()))
      return (await lpAccount.getGetLpAccountData()) ?? 0n
    },
    enabled: !!token0Address && !!token1Address && !!get(addressAtom),
    staleTime: QUERY_DEFAULT_STALE_TIME,
    refetchInterval: QUERY_DEFAULT_STALE_TIME,
  }))
}, isEqual)
