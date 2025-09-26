import { ISortOrder } from '@pancakeswap/uikit'
import { DEFAULT_ACTIVE_LIST_URLS } from 'config/constants/lists'
import { useTokenListPrepared } from 'hooks/useTokenListPrepared'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useMemo, useState } from 'react'
import { PoolInfo } from 'state/farmsV4/state/type'
import { farmsSearchV2Atom } from 'views/universalFarms/atom/farmsSearchAtom'
import { searchQueryAtom, updateSortAtom } from 'views/universalFarms/atom/searchQueryAtom'

interface UseMiniPoolsDataReturn {
  pools: PoolInfo[]
  isLoading: boolean
  loadMore: () => void
  handleSort: (sort: { order: ISortOrder; dataIndex: string | null }) => void
}

export const useMiniPoolsData = (): UseMiniPoolsDataReturn => {
  // Prepare token lists
  const listPrepared = useTokenListPrepared(DEFAULT_ACTIVE_LIST_URLS)

  const query = useAtomValue(searchQueryAtom)

  // Use existing Universal Farms atoms
  const [page, setPage] = useState(0)
  const farmSearchResult = useAtomValue(farmsSearchV2Atom({ ...query, page }))

  const pools = useMemo(() => farmSearchResult.list.unwrapOr([]), [farmSearchResult])

  const updateSort = useSetAtom(updateSortAtom)

  const isLoading = useMemo(
    () => pools.length === 0 && (farmSearchResult.isLoading || listPrepared.isPending()),
    [pools, farmSearchResult, listPrepared],
  )

  const loadMore = useCallback(() => {
    setPage((prev) => (prev ?? 0) + 1)
  }, [setPage])

  const handleSort = useCallback(
    ({ order, dataIndex }) => {
      updateSort({
        order,
        dataIndex,
      })
    },
    [query, updateSort],
  )

  return {
    pools,
    isLoading,
    loadMore,
    handleSort,
  }
}
