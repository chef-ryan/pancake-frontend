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
      })),
    [poolsWithBalance, poolInfos],
  )

  const isFetched = isPoolBalanceFetched && isPoolDataFetched

  return { ...rest, data: finalPoolData, isFetched }
}
