import { useIntersectionObserver } from '@pancakeswap/hooks'
import { Loading, SORT_ORDER, TableView, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useRouter } from 'next/router'
import { Suspense, useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components'

import { useActiveChainId } from 'hooks/useActiveChainId'
import { useAtomValue, useSetAtom } from 'jotai'
import { PoolInfo } from 'state/farmsV4/state/type'
import LoadingTable from 'views/LimitOrders/components/LimitOrderTable/LoadingTable'
import { farmsSearchAtom, farmsSearchPagingAtom } from './atom/farmsSearchAtom'
import {
  Card,
  CardBody,
  CardHeader,
  getPoolDetailPageLink,
  IPoolsFilterPanelProps,
  ListView,
  PoolsFilterPanel,
  useColumnConfig,
  useSelectedProtocols,
} from './components'
import { AddLiquidityButton } from './components/AddLiquidityButton'
import { FarmSearchContextProvider } from './hooks/useFarmSearchContext'
import { useFilterToQueries } from './hooks/useFilterToQueries'

const PoolsContent = styled.div`
  min-height: calc(100vh - 64px - 56px);
`

export const PoolsPage = () => {
  const nextRouter = useRouter()
  const { isMobile, isMd } = useMatchBreakpoints()
  const { chainId } = useActiveChainId()

  const columns = useColumnConfig()
  const {
    search,
    selectedProtocolIndex,
    selectedNetwork,
    selectedTokens,
    sortOrder,
    sortField,
    replaceURLQueriesByFilter,
  } = useFilterToQueries()

  const poolsFilter = useMemo(
    () => ({
      selectedProtocolIndex,
      selectedNetwork,
      selectedTokens,
      search,
    }),
    [selectedProtocolIndex, selectedNetwork, selectedTokens, search],
  )

  const selectedProtocols = useSelectedProtocols(selectedProtocolIndex)
  const { observerRef, isIntersecting } = useIntersectionObserver()

  const handleFilterChange: IPoolsFilterPanelProps['onChange'] = useCallback(
    (newFilters) => {
      replaceURLQueriesByFilter({
        ...poolsFilter,
        sortOrder,
        sortField,
        ...newFilters,
      })
    },
    [replaceURLQueriesByFilter, poolsFilter, sortOrder, sortField],
  )

  const handleSort = useCallback(
    ({ order, dataIndex }) => {
      replaceURLQueriesByFilter({
        ...poolsFilter,
        // we don't need asc sort, so reset it to null
        sortField: order === SORT_ORDER.ASC ? null : dataIndex,
        sortOrder: order === SORT_ORDER.ASC ? SORT_ORDER.NULL : order,
      })
    },
    [replaceURLQueriesByFilter, poolsFilter],
  )

  const handleRowClick = useCallback(
    async (pool: PoolInfo) => {
      const data = await getPoolDetailPageLink(pool)
      nextRouter.push(data)
    },
    [nextRouter],
  )

  const getRowKey = useCallback((item: PoolInfo) => {
    const farm = item.farm!
    return `${farm.chainId}:${farm.id}`
  }, [])

  const query = {
    keywords: search,
    chains: selectedNetwork,
    protocols: selectedProtocols,
    sortBy: sortField,
    sortOrder,
    activeChainId: chainId,
  }
  const setPaging = useSetAtom(farmsSearchPagingAtom(query))
  const list = useAtomValue(farmsSearchAtom(query))

  useEffect(() => {
    if (isIntersecting) {
      setPaging((v) => v + 1)
    }
  }, [isIntersecting, setPaging])

  return (
    <FarmSearchContextProvider>
      <Card>
        <CardHeader p={isMobile ? '16px' : undefined}>
          <PoolsFilterPanel onChange={handleFilterChange} value={poolsFilter}>
            {(isMobile || isMd) && <AddLiquidityButton height="40px" scale="sm" width="100%" />}
          </PoolsFilterPanel>
        </CardHeader>
        <CardBody
          style={{
            opacity: list.isPending() ? 0.2 : 1,
          }}
        >
          <Suspense>
            <PoolsContent>
              {list.hasValue() && (
                <>
                  {isMobile ? (
                    <ListView data={list.unwrapOr([])} onRowClick={handleRowClick} />
                  ) : (
                    <TableView
                      getRowKey={getRowKey}
                      columns={columns}
                      data={list.unwrapOr([])}
                      onSort={handleSort}
                      sortOrder={sortOrder}
                      sortField={sortField}
                      onRowClick={handleRowClick}
                    />
                  )}
                </>
              )}
              {!list.hasValue() && <Loading />}
            </PoolsContent>
            {list.unwrapOr([]).length > 0 && <div ref={observerRef} />}
          </Suspense>
        </CardBody>
      </Card>
    </FarmSearchContextProvider>
  )
}

const StyledLoadingTable = styled(LoadingTable)`
  min-height: calc(100vh - 64px - 56px);
`
