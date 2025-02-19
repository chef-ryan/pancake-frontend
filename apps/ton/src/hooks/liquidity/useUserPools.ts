import { PRESET_POOLS } from 'config/presetPools'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { lpBalanceByPoolsQueryAtom } from 'ton/atom/liquidity/lpBalanceByPoolsQueryAtom'
import { poolDataMultipleQueryAtom } from 'ton/atom/liquidity/poolDataMultipleQueryAtom'
import { networkAtom } from 'ton/atom/networkAtom'
import { getTokenOrder } from 'ton/utils/address'

interface RawPoolData {
  balance: bigint
  poolAddress: string
}

interface InitialPoolData extends RawPoolData {
  token0: string
  token1: string
}

interface CombinedPoolData extends InitialPoolData {
  amount0: bigint
  amount1: bigint
  reserve0: bigint
  reserve1: bigint
  totalSupply: bigint
}

interface PoolInfo {
  reserve0: bigint
  reserve1: bigint
  totalSupply: bigint
}

const getTokenPairs = (network: string): string[][] =>
  Object.keys(PRESET_POOLS[network]).map((tokenPair) => tokenPair.split('<>'))

const getPoolsWithBalance = (pools: RawPoolData[], tokenPairs: string[][]): InitialPoolData[] =>
  pools
    .map((pool, index) => {
      const { token0, token1 } = getTokenOrder(tokenPairs[index][0], tokenPairs[index][1])
      return {
        ...pool,
        token0,
        token1,
      }
    })
    .filter((pool) => pool.balance > 0n)

const combinePoolData = (poolsWithBalance: InitialPoolData[], poolInfos: PoolInfo[]): CombinedPoolData[] =>
  poolsWithBalance.map((pool, index) => ({
    ...pool,
    amount0: poolInfos[index] ? (pool.balance * poolInfos[index].reserve0) / poolInfos[index].totalSupply : 0n,
    amount1: poolInfos[index] ? (pool.balance * poolInfos[index].reserve1) / poolInfos[index].totalSupply : 0n,
    reserve0: poolInfos[index]?.reserve0 ?? 0n,
    reserve1: poolInfos[index]?.reserve1 ?? 0n,
    totalSupply: poolInfos[index]?.totalSupply ?? 0n,
  }))

export const useUserPools = () => {
  const network = useAtomValue(networkAtom)
  const tokenPairs = useMemo(() => getTokenPairs(network), [network])

  const {
    data: pools,
    isFetched: isPoolBalanceFetched,
    ...rest
  } = useAtomValue(lpBalanceByPoolsQueryAtom(Object.values(PRESET_POOLS[network])))

  const poolsWithBalance = useMemo(() => getPoolsWithBalance(pools, tokenPairs), [pools, tokenPairs])

  // Liquidity Pool Information
  const { data: poolInfos, isFetched: isPoolDataFetched } = useAtomValue(
    poolDataMultipleQueryAtom(poolsWithBalance.map((pool) => pool.poolAddress)),
  )

  const finalPoolData = useMemo(() => combinePoolData(poolsWithBalance, poolInfos), [poolsWithBalance, poolInfos])

  console.log('useUserPools', {
    finalPoolData,
    poolsWithBalance,
    pools,
    presetPools: Object.values(PRESET_POOLS[network]),
  })

  const isFetched = isPoolBalanceFetched && isPoolDataFetched

  return {
    ...rest,
    data: finalPoolData,
    isFetched,
  }
}
