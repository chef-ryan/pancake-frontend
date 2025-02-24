import { QUERY_DEFAULT_STALE_TIME } from 'config/constants/exchange'
import { atomWithQuery } from 'jotai-tanstack-query'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { getLpWalletAddress } from 'ton/utils/api'
import { addressAtom } from '../addressAtom'
import { chainIdAtom } from '../chainIdAtom'
import { lpWalletContractAtom } from '../contracts/lpWalletContractAtom'
import { networkAtom } from '../networkAtom'
import { poolAddressAtom } from './poolAddressAtom'

interface LpBalanceQueryAtomProps {
  token0Address?: string
  token1Address?: string
}

export const lpBalanceQueryAtom = atomFamily(({ token0Address, token1Address }: LpBalanceQueryAtomProps) => {
  return atomWithQuery((get) => ({
    queryKey: ['lpBalance', get(networkAtom), token0Address, token1Address, get(addressAtom)],
    queryFn: async () => {
      const userAddress = get(addressAtom)
      if (!userAddress) return 0n

      const poolAddress = await get(poolAddressAtom({ token0Address, token1Address }))
      if (!poolAddress) return 0n

      // const pool = get(poolContractAtom(poolAddress))
      // const lpWalletAddress = await pool.getGetWalletAddress(parseAddress(userAddress))
      const lpWalletAddress = await getLpWalletAddress(get(chainIdAtom), userAddress, poolAddress.toString())

      const lpWallet = get(lpWalletContractAtom(lpWalletAddress.toString()))
      return (await lpWallet.getGetWalletData()).balance ?? 0n
    },
    enabled: !!token0Address && !!token1Address,
    refetchInterval: QUERY_DEFAULT_STALE_TIME,
  }))
}, isEqual)
