import { useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { atom, useAtomValue } from 'jotai'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { networkAtom } from '../networkAtom'
import { getKeyByPair, poolDataQueryAtom } from './poolDataQueryAtom'

interface PoolDataAtomParams {
  token0Address?: string
  token1Address?: string
}

export const poolDataQueriesAtom = atomFamily((pairs: PoolDataAtomParams[]) => {
  const result = atom((get) => {
    const results = pairs.map((pair) => get(poolDataQueryAtom(pair)))

    return {
      isFetching: results.some((i) => i?.isFetching),
      isLoading: results.some((i) => i?.isLoading),
      data: results.map((i) => i?.data),
    }
  })
  return result
}, isEqual)

export function useRefreshPoolData(pairs: PoolDataAtomParams[]) {
  const queryClient = useQueryClient()
  const network = useAtomValue(networkAtom)
  const queryKey = useMemo(
    () => pairs.map(({ token0Address, token1Address }) => getKeyByPair({ token0Address, token1Address, network })),
    [network, pairs],
  )

  const refresh = () => {
    // Invalidate all queries
    queryClient.invalidateQueries({
      queryKey,
    })
  }

  return { refresh }
}
