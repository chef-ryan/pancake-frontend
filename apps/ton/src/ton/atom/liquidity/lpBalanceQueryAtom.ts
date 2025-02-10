import { QUERY_DEFAULT_STALE_TIME } from 'config/constants/exchange'
import { atomWithQuery } from 'jotai-tanstack-query'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { parseAddress } from 'ton/utils/address'
import { addressAtom } from '../addressAtom'
import { lpWalletContractAtom } from '../contracts/lpWalletContractAtom'
import { poolContractAtom } from '../contracts/poolContractAtom'
import { networkAtom } from '../networkAtom'
import { poolAddressAtom } from './poolAddressAtom'

interface LpBalanceQueryAtomProps {
  token0Address?: string
  token1Address?: string
}

export const lpBalanceQueryAtom = atomFamily(({ token0Address, token1Address }: LpBalanceQueryAtomProps) => {
  return atomWithQuery((get) => ({
    queryKey: ['lpBalance', get(networkAtom), token0Address, token1Address],
    queryFn: async () => {
      const userAddress = get(addressAtom)
      if (!userAddress) return 0n

      const poolAddress = await get(poolAddressAtom({ token0Address, token1Address }))
      if (!poolAddress) return 0n

      const pool = get(poolContractAtom(poolAddress))

      const lpWalletAddress = await pool.getGetWalletAddress(parseAddress(userAddress))
      const lpWallet = get(lpWalletContractAtom(lpWalletAddress.toString()))
      return (await lpWallet.getGetWalletData()).balance ?? 0n
    },
    enabled: !!token0Address && !!token1Address,
    staleTime: QUERY_DEFAULT_STALE_TIME,
    refetchInterval: QUERY_DEFAULT_STALE_TIME,
  }))
}, isEqual)
