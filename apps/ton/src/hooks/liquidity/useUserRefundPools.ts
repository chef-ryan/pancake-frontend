import { useQuery } from '@tanstack/react-query'
import { addUserRefundPoolAtom, updateUserRefundPoolAtom, userRefundPoolsAtom } from 'atoms/user/userRefundPoolsAtom'
import BN from 'bignumber.js'
import { QUERY_DEFAULT_STALE_TIME } from 'config/constants/exchange'
import { POOL_CHUNK_DELAY, POOL_CHUNK_SIZE } from 'config/constants/fetching'
import { PRESET_POOLS } from 'config/presetPools'
import { useAtomValue, useSetAtom } from 'jotai'
import chunk from 'lodash/chunk'
import uniqWith from 'lodash/uniqWith'

import { cachedUserPoolsAtom } from 'atoms/user/userPoolsAtom'
import { useMemo } from 'react'
import { addressAtom } from 'ton/atom/addressAtom'
import { chainIdAtom } from 'ton/atom/chainIdAtom'
import { TonContext } from 'ton/context/TonContext'
import { parseAddress } from 'ton/utils/address'
import { getLpAccountAddress } from 'ton/utils/api'
import { getTokenOrder } from 'ton/utils/tokenOrder'
import { LpAccount } from 'ton/wrappers/tact_LpAccount'
import { RefundPool } from 'types/pools'

/**
 * Fetch pools with refunds available for the user
 */
export const useUserRefundPools = () => {
  const client = TonContext.instance.getClient()

  const userAddress = useAtomValue(addressAtom)
  const chainId = useAtomValue(chainIdAtom)

  const refundPools = useAtomValue(userRefundPoolsAtom)
  const addRefundPool = useSetAtom(addUserRefundPoolAtom)
  const updateRefundPool = useSetAtom(updateUserRefundPoolAtom)

  const cachedUserPools = useAtomValue(cachedUserPoolsAtom)

  const chunkedPresetPools = useMemo(() => {
    return chunk(
      uniqWith(
        [...cachedUserPools, ...Object.values(PRESET_POOLS[chainId])],
        (a, b) => a.poolAddress === b.poolAddress,
      ),
      POOL_CHUNK_SIZE,
    )
  }, [chainId, cachedUserPools])

  const { isFetching } = useQuery({
    queryKey: ['refundPools', chainId, userAddress],
    queryFn: async () => {
      for (const pools of chunkedPresetPools) {
        // eslint-disable-next-line no-await-in-loop
        await Promise.allSettled(
          pools.map(async (pool) => {
            // Fetch lp account data
            const lpAccountAddress = await getLpAccountAddress(chainId, userAddress, pool.poolAddress)
            const lpAccountData = await client
              .open(LpAccount.fromAddress(parseAddress(lpAccountAddress)))
              .getGetLpAccountData()

            if (lpAccountData && (lpAccountData.amount0 > 0n || lpAccountData.amount1 > 0n)) {
              // Determine token order
              let { token0, token1 } = pool
              const { isFlipped } = await getTokenOrder(chainId, pool.token0, pool.token1)
              if (isFlipped) {
                token0 = pool.token1
                token1 = pool.token0
              }

              const result: RefundPool = {
                token0,
                token1,
                poolAddress: pool.poolAddress,
                lpAccountAddress,
                refundAmount0: BN(lpAccountData.amount0.toString()),
                refundAmount1: BN(lpAccountData.amount1.toString()),
              }

              if (refundPools.some((refundPool) => refundPool.poolAddress === pool.poolAddress)) {
                updateRefundPool(result)
              } else {
                addRefundPool(result)
              }
            }
          }),
        )

        // Sleep for 100ms (Delay between fetching chunks)
        // eslint-disable-next-line no-await-in-loop
        await new Promise((resolve) => setTimeout(resolve, POOL_CHUNK_DELAY))
      }

      return null
    },
    enabled: !!userAddress,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: QUERY_DEFAULT_STALE_TIME,
  })

  return {
    refundPools,
    isFetching,
  }
}
