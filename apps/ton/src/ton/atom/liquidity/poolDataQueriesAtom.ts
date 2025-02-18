import { useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { QUERY_DEFAULT_STALE_TIME } from 'config/constants/exchange'
import { atomWithQuery } from 'jotai-tanstack-query'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { poolContractAtom } from '../contracts/poolContractAtom'
import { networkAtom } from '../networkAtom'
import { poolAddressAtom } from './poolAddressAtom'

interface PoolDataAtomParams {
  token0Address?: string
  token1Address?: string
}

const getKeyByPairs = (pairs: PoolDataAtomParams[]) => {
  return pairs.map(({ token0Address, token1Address }) => `${token0Address}-${token1Address}`)
}

export const poolDataQueriesAtom = atomFamily((pairs: PoolDataAtomParams[]) => {
  const key = getKeyByPairs(pairs)
  return atomWithQuery((get) => ({
    queryKey: ['poolData', get(networkAtom), ...key],
    queryFn: async () => {
      const result = await Promise.allSettled(
        pairs.map(async ({ token0Address, token1Address }) => {
          const poolAddress = await get(poolAddressAtom({ token0Address, token1Address }))

          if (!poolAddress) {
            throw new Error('fetch poolAddress failed')
          }

          const poolData = await get(poolContractAtom(poolAddress)).getGetPoolData()
          return {
            ...poolData,
            poolAddress,
          }
        }),
      )
      return result.map((item) => (item.status === 'fulfilled' ? item.value : null))
    },
    enabled: !!key.length,
    refetchInterval: QUERY_DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
    retry: 10,
  }))
}, isEqual)

export function useRefreshPoolData(pairs: PoolDataAtomParams[]) {
  const queryClient = useQueryClient()
  const network = useAtomValue(networkAtom)
  const queryKey = useMemo(() => ['poolData', network, ...getKeyByPairs(pairs)], [network, pairs])

  const refresh = () => {
    // Invalidate all queries
    queryClient.invalidateQueries({
      queryKey,
    })
  }

  return { refresh }
}
