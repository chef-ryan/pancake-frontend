import { PRESET_POOLS } from 'config/presetPools'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { lpAccountMultipleQueryAtom } from 'ton/atom/liquidity/lpAccountMultipleQueryAtom'
import { networkAtom } from 'ton/atom/networkAtom'
import { getTokenOrder } from 'ton/utils/address'

const getTokenPairs = (network: string): string[][] =>
  Object.keys(PRESET_POOLS[network]).map((tokenPair) => tokenPair.split('<>'))

/**
 * Fetch pools with refunds available for the user
 */
export const useUserRefundPools = () => {
  const network = useAtomValue(networkAtom)
  const poolAddresses = useMemo(() => Object.values(PRESET_POOLS[network]), [network])
  const tokenPairs = useMemo(() => getTokenPairs(network), [network])

  // Fetch LpAccounts for Refund Data
  const { data: lpAccounts, isFetching } = useAtomValue(lpAccountMultipleQueryAtom(poolAddresses))

  const poolsWithRefunds = useMemo(() => {
    if (!lpAccounts) return []

    return lpAccounts
      .filter((lpAccount) => lpAccount.amount0 > 0n || lpAccount.amount1 > 0n)
      .map((lpAccount, index) => {
        const tokenPair = tokenPairs[index]
        const [token0_, token1_] = tokenPair

        const { token0, token1 } = getTokenOrder(token0_, token1_)

        return {
          token0,
          token1,
          poolAddress: lpAccount.poolAddress,
          refundAmount0: lpAccount.amount0,
          refundAmount1: lpAccount.amount1,
          lpAccountAddress: lpAccount.lpAccountAddress,
        }
      })
  }, [lpAccounts, tokenPairs])

  return {
    poolsWithRefunds,
    isFetching,
  }
}
