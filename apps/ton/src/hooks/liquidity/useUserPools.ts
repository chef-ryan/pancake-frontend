import { PRESET_POOLS } from 'config/presetPools'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { lpBalanceByPoolsQueryAtom } from 'ton/atom/liquidity/lpBalanceByPoolsQueryAtom'
import { poolDataMultipleQueryAtom } from 'ton/atom/liquidity/poolDataMultipleQueryAtom'
import { networkAtom } from 'ton/atom/networkAtom'

export const useUserPools = () => {
  const network = useAtomValue(networkAtom)
  const {
    data: pools,
    isLoading: isPoolBalanceLoading,
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
  const { data: poolInfos, isLoading: isPoolDataLoading } = useAtomValue(
    poolDataMultipleQueryAtom(poolsWithBalance.map((pool) => pool.poolAddress)),
  )

  // Combine relevant data
  const finalPoolData = useMemo(() => {
    return poolsWithBalance.map((pool, index) => ({
      ...pool,
      amount0: poolInfos[index] ? (pool.balance * poolInfos[index].reserve0) / poolInfos[index].totalSupply : 0n,
      amount1: poolInfos[index] ? (pool.balance * poolInfos[index].reserve1) / poolInfos[index].totalSupply : 0n,
      totalSupply: poolInfos[index]?.totalSupply,
      reserve0: poolInfos[index]?.reserve0,
      reserve1: poolInfos[index]?.reserve1,
    }))
  }, [poolsWithBalance, poolInfos])

  // TODO: (@penguin) investigate why loading is always false
  const isLoading = useMemo(() => isPoolBalanceLoading || isPoolDataLoading, [isPoolBalanceLoading, isPoolDataLoading])

  return { data: finalPoolData, isLoading, isPoolBalanceLoading, isPoolDataLoading, ...rest }
}
