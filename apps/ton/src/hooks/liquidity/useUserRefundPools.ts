import { useQuery } from '@tanstack/react-query'
import { PRESET_POOLS } from 'config/presetPools'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { chainIdAtom } from 'ton/atom/chainIdAtom'
import { lpAccountMultipleQueryAtom } from 'ton/atom/liquidity/lpAccountMultipleQueryAtom'
import { networkAtom } from 'ton/atom/networkAtom'
import { getTokenOrder } from 'ton/utils/tokenOrder'
import { parsePresetKey, stringify } from 'utils'

const getTokenPairs = (network: string): string[][] =>
  Object.keys(PRESET_POOLS[network]).map((tokenPair) => parsePresetKey(tokenPair))

/**
 * Fetch pools with refunds available for the user
 */
export const useUserRefundPools = () => {
  const chainId = useAtomValue(chainIdAtom)
  const network = useAtomValue(networkAtom)

  const poolAddresses = useMemo(() => Object.values(PRESET_POOLS[network]), [network])
  const tokenPairs = useMemo(() => getTokenPairs(network), [network])

  // Fetch LpAccounts for Refund Data
  const { data: lpAccounts, isFetching: isFetchingLpAccounts } = useAtomValue(lpAccountMultipleQueryAtom(poolAddresses))

  const { data: poolsWithRefunds, isFetching: isFetchingOrdered } = useQuery({
    queryKey: ['poolsWithRefunds', chainId, stringify(lpAccounts)],
    queryFn: async () => {
      if (!lpAccounts) return []

      return (
        await Promise.all(
          lpAccounts.map(async (lpAccount, index) => {
            const tokenPair = tokenPairs[index]
            const [token0_, token1_] = tokenPair

            const { token0, token1 } = await getTokenOrder(chainId, token0_, token1_)

            return {
              token0,
              token1,
              poolAddress: lpAccount.poolAddress,
              refundAmount0: lpAccount.amount0,
              refundAmount1: lpAccount.amount1,
              lpAccountAddress: lpAccount.lpAccountAddress,
            }
          }),
        )
      ).filter((pool) => pool.refundAmount0 > 0n || pool.refundAmount1 > 0n)
    },
    initialData: [],
  })

  const isFetching = isFetchingLpAccounts || isFetchingOrdered

  return {
    poolsWithRefunds,
    isFetching,
  }
}
