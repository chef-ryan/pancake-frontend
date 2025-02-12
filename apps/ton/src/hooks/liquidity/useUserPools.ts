import { PRESET_POOLS } from 'config/presetPools'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { lpAccountByPoolsAtom } from 'ton/atom/liquidity/lpAccountByPoolsQueryAtom'
import { lpBalanceByPoolsQueryAtom } from 'ton/atom/liquidity/lpBalanceByPoolsQueryAtom'
import { poolDataMultipleQueryAtom } from 'ton/atom/liquidity/poolDataMultipleQueryAtom'
import { networkAtom } from 'ton/atom/networkAtom'

export const useUserPools = () => {
  const network = useAtomValue(networkAtom)
  const { data: pools, ...rest } = useAtomValue(lpBalanceByPoolsQueryAtom(Object.values(PRESET_POOLS[network])))

  const tokenPairs = useMemo(() => Object.keys(PRESET_POOLS[network]).map((pool) => pool.split('<>')), [network])

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

  console.log('useUserPools poolsWithBalance', { pools, poolsWithBalance, tokenPairs })

  // Fetch user's deposited amount0 and amount1 from LpAccount
  const { data: lpAccounts } = useAtomValue(lpAccountByPoolsAtom(poolsWithBalance.map((pool) => pool.poolAddress)))

  // Fetch pool's basic info for totalSupply and reserves
  const { data: poolInfos } = useAtomValue(poolDataMultipleQueryAtom(poolsWithBalance.map((pool) => pool.poolAddress)))

  console.log('useUserPools Precombine', {
    pools,
    poolsWithBalance,
    lpAccounts,
    poolInfos,
  })

  // Combine relevant data
  const finalPoolData = useMemo(() => {
    return poolsWithBalance.map((pool, index) => ({
      ...pool,
      amount0: lpAccounts ? lpAccounts[index]?.amount0 : undefined,
      amount1: lpAccounts ? lpAccounts[index]?.amount1 : undefined,
      totalSupply: poolInfos[index]?.totalSupply,
      reserve0: poolInfos[index]?.reserve0,
      reserve1: poolInfos[index]?.reserve1,
    }))
  }, [poolsWithBalance, lpAccounts, poolInfos])

  console.log('useUserPools', finalPoolData)

  return { data: finalPoolData, ...rest }
}
