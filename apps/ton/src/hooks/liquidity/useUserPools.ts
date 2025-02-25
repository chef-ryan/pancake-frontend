import BN from 'bignumber.js'
import { PRESET_POOLS } from 'config/presetPools'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { lpBalanceByPoolsQueryAtom } from 'ton/atom/liquidity/lpBalanceByPoolsQueryAtom'
import { poolDataMultipleQueryAtom } from 'ton/atom/liquidity/poolDataMultipleQueryAtom'
import { networkAtom } from 'ton/atom/networkAtom'
import { getTokenOrder } from 'ton/utils/address'
import { parsePresetKey } from 'utils'

interface RawPoolData {
  balance: bigint
  poolAddress: string
}

interface InitialPoolData extends RawPoolData {
  token0: string
  token1: string
}

interface CombinedPoolData extends Omit<InitialPoolData, 'balance'> {
  balance: BN
  amount0: BN
  amount1: BN
  reserve0: BN
  reserve1: BN
  totalSupply: BN
  userShare?: number
}

interface PoolInfo {
  reserve0: bigint
  reserve1: bigint
  totalSupply: bigint
}

const getTokenPairs = (network: string): string[][] =>
  Object.keys(PRESET_POOLS[network]).map((tokenPair) => parsePresetKey(tokenPair))

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
  poolsWithBalance.map((pool, index) => {
    const { reserve0, reserve1, totalSupply } = poolInfos[index] ?? { reserve0: 0n, reserve1: 0n, totalSupply: 0n }
    return {
      ...pool,
      balance: new BN(pool.balance.toString()),
      amount0: poolInfos[index]
        ? new BN(pool.balance.toString()).multipliedBy(reserve0.toString()).dividedBy(totalSupply.toString())
        : BN(0),
      amount1: poolInfos[index]
        ? new BN(pool.balance.toString()).multipliedBy(reserve1.toString()).dividedBy(totalSupply.toString())
        : BN(0),
      reserve0: new BN(poolInfos[index]?.reserve0.toString() ?? '0'),
      reserve1: new BN(poolInfos[index]?.reserve1.toString() ?? '0'),
      totalSupply: new BN(poolInfos[index]?.totalSupply.toString() ?? '0'),
      userShare: poolInfos[index]
        ? new BN(pool.balance.toString()).multipliedBy(100).dividedBy(totalSupply.toString()).toNumber()
        : 0,
    }
  })

export const useUserPools = () => {
  const network = useAtomValue(networkAtom)
  const tokenPairs = useMemo(() => getTokenPairs(network), [network])

  const {
    data: pools,
    isFetched: isPoolBalanceFetched,
    ...rest
  } = useAtomValue(lpBalanceByPoolsQueryAtom(Object.values(PRESET_POOLS[network])))

  // Filter out pools with zero user balance
  const poolsWithBalance = useMemo(() => getPoolsWithBalance(pools, tokenPairs), [pools, tokenPairs])

  // Liquidity Pool Information
  const { data: poolInfos, isFetched: isPoolDataFetched } = useAtomValue(
    poolDataMultipleQueryAtom(poolsWithBalance.map((pool) => pool.poolAddress)),
  )

  const finalPoolData = useMemo(() => combinePoolData(poolsWithBalance, poolInfos), [poolsWithBalance, poolInfos])

  const isFetched = isPoolBalanceFetched && isPoolDataFetched

  return {
    ...rest,
    data: finalPoolData,
    isFetched,
  }
}
