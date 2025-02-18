import { PRESET_POOLS } from 'config/presetPools'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { lpAccountMultipleQueryAtom } from 'ton/atom/liquidity/lpAccountMultipleQueryAtom'
import { lpBalanceByPoolsQueryAtom } from 'ton/atom/liquidity/lpBalanceByPoolsQueryAtom'
import { poolDataMultipleQueryAtom } from 'ton/atom/liquidity/poolDataMultipleQueryAtom'
import { networkAtom } from 'ton/atom/networkAtom'

export const useUserPools = () => {
  const network = useAtomValue(networkAtom)
  const {
    data: pools,
    isFetched: isPoolBalanceFetched,
    ...rest
  } = useAtomValue(lpBalanceByPoolsQueryAtom(Object.values(PRESET_POOLS[network])))

  const tokenPairs = useMemo(
    () => Object.keys(PRESET_POOLS[network]).map((tokenPair) => tokenPair.split('<>')),
    [network],
  )

  const poolsWithBalance = useMemo(
    () =>
      pools
        .map((pool, index) => ({
          ...pool,
          token0: tokenPairs[index][0],
          token1: tokenPairs[index][1],
        }))
        .filter((pool) => pool.balance > 0n),
    [pools, tokenPairs],
  )

  // Fetch pool's basic info for totalSupply and reserves
  const { data: poolInfos, isFetched: isPoolDataFetched } = useAtomValue(
    poolDataMultipleQueryAtom(poolsWithBalance.map((pool) => pool.poolAddress)),
  )

  // Fetch refund amounts (Don't need to wait for this to load)
  const { data: lpAccounts } = useAtomValue(
    lpAccountMultipleQueryAtom(poolsWithBalance.map((pool) => pool.poolAddress)),
  )

  // Combine relevant data
  const finalPoolData = useMemo(
    () =>
      poolsWithBalance.map((pool, index) => ({
        ...pool,
        amount0: poolInfos[index] ? (pool.balance * poolInfos[index].reserve0) / poolInfos[index].totalSupply : 0n,
        amount1: poolInfos[index] ? (pool.balance * poolInfos[index].reserve1) / poolInfos[index].totalSupply : 0n,
        reserve0: poolInfos[index]?.reserve0,
        reserve1: poolInfos[index]?.reserve1,
        totalSupply: poolInfos[index]?.totalSupply,

        // Refunds from LpAccount
        refund0: lpAccounts[index]?.amount0,
        refund1: lpAccounts[index]?.amount1,
        isEligibleForRefund: lpAccounts[index]?.amount0 > 0n || lpAccounts[index]?.amount1 > 0n,
        lpAccountAddress: lpAccounts[index]?.lpAccountAddress,
      })),
    [poolsWithBalance, poolInfos, lpAccounts],
  )

  const isFetched = isPoolBalanceFetched && isPoolDataFetched

  return {
    ...rest,
    data: finalPoolData,
    isFetched,
    hasClaimableRefunds: finalPoolData.some((pool) => pool.isEligibleForRefund),
  }
}
