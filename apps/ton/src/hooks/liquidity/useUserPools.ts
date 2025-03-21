import { useQuery } from '@tanstack/react-query'
import { addUserPoolAtom, cachedUserPoolsAtom, updateUserPoolAtom, userPoolsAtom } from 'atoms/user/userPoolsAtom'
import BN from 'bignumber.js'
import { QUERY_MEDIUM_STALE_TIME } from 'config/constants/exchange'
import { POOL_CHUNK_DELAY, POOL_CHUNK_SIZE } from 'config/constants/fetching'
import { PRESET_POOLS } from 'config/presetPools'
import { txReceiptAtom } from 'hooks/useLatestTxReceipt'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import chunk from 'lodash/chunk'
import uniqWith from 'lodash/uniqWith'
import { useMemo } from 'react'
import { addressAtom } from 'ton/atom/addressAtom'
import { chainIdAtom } from 'ton/atom/chainIdAtom'
import { TonContext } from 'ton/context/TonContext'
import { parseAddress } from 'ton/utils/address'
import { getLpWalletAddress } from 'ton/utils/api'
import { getTokenOrder } from 'ton/utils/tokenOrder'
import { LpWallet } from 'ton/wrappers/tact_LpWallet'
import { Pool } from 'ton/wrappers/tact_Pool'
import { CombinedPoolData, InitialPoolData } from 'types/pools'

export const useUserPools = () => {
  const client = TonContext.instance.getClient()

  const userAddress = useAtomValue(addressAtom)
  const chainId = useAtomValue(chainIdAtom)

  const userPools = useAtomValue(userPoolsAtom)
  const txReceipt = useAtomValue(txReceiptAtom)

  const addUserPool = useSetAtom(addUserPoolAtom)
  const updateUserPool = useSetAtom(updateUserPoolAtom)

  const [cachedUserPools, setCachedUserPools] = useAtom(cachedUserPoolsAtom)

  const chunkedPresetPools = useMemo(() => {
    return chunk(
      uniqWith(
        [...cachedUserPools, ...Object.values(PRESET_POOLS[chainId])],
        (a, b) => a.poolAddress === b.poolAddress,
      ),
      POOL_CHUNK_SIZE,
    )
  }, [chainId, cachedUserPools])

  const { isFetched, isLoading } = useQuery({
    queryKey: ['userPools', chunkedPresetPools, chainId, userAddress, txReceipt],
    queryFn: async () => {
      const cachedPools = [] as InitialPoolData[]

      for (const pools of chunkedPresetPools) {
        // eslint-disable-next-line no-await-in-loop
        await Promise.allSettled(
          pools.map(async (pool) => {
            const lpWalletAddress = await getLpWalletAddress(chainId, userAddress, pool.poolAddress)
            const lpBalance = (
              await client.open(LpWallet.fromAddress(parseAddress(lpWalletAddress))).getGetWalletData()
            ).balance

            if (lpBalance > 0n) {
              // Fetch pool data
              const poolContract = client.open(Pool.fromAddress(parseAddress(pool.poolAddress)))
              const { reserve0, reserve1, totalSupply } = await poolContract.getGetPoolData()

              // Determine token order
              let { token0, token1 } = pool
              const { isFlipped } = await getTokenOrder(chainId, pool.token0, pool.token1)
              if (isFlipped) {
                token0 = pool.token1
                token1 = pool.token0
              }

              const combinedPoolData: CombinedPoolData = {
                // User's LP balance of token0
                balance: BN(lpBalance.toString()),
                amount0: BN(lpBalance.toString()).multipliedBy(reserve0.toString()).dividedBy(totalSupply.toString()),
                amount1: BN(lpBalance.toString()).multipliedBy(reserve1.toString()).dividedBy(totalSupply.toString()),
                reserve0: BN(reserve0.toString()),
                reserve1: BN(reserve1.toString()),
                totalSupply: BN(totalSupply.toString()),
                userShare: BN(lpBalance.toString()).multipliedBy(100).dividedBy(totalSupply.toString()).toNumber(),
                token0,
                token1,
                poolAddress: pool.poolAddress,
              }

              if (userPools.some((userPool) => userPool.poolAddress === pool.poolAddress)) {
                updateUserPool(combinedPoolData)
              } else {
                addUserPool(combinedPoolData)
                cachedPools.push(pool)
              }
            }
          }),
        )

        // Delay between fetching each chunk
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, POOL_CHUNK_DELAY))
      }

      // Set pools to prioritize loading first next time
      if (cachedPools.length > 0) setCachedUserPools(cachedPools)

      return []
    },
    enabled: !!userAddress,
    refetchOnMount: false,
    refetchOnWindowFocus: true,
    refetchInterval: QUERY_MEDIUM_STALE_TIME,
  })

  return { data: userPools, isFetched, isLoading }
}
