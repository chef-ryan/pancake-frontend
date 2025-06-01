import { useTheme } from '@pancakeswap/hooks'
import { useTranslation } from '@pancakeswap/localization'
import { Button, InfoIcon, SORT_ORDER, TableView, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useRouter } from 'next/router'
import { Suspense, useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'

import { useAtomValue } from 'jotai'
import { PoolInfo } from 'state/farmsV4/state/type'
import LoadingTable from 'views/LimitOrders/components/LimitOrderTable/LoadingTable'
import { farmsSearchAtom } from './atom/farmsSearchAtom'
import {
  Card,
  CardBody,
  CardFooter,
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
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { isMobile, isMd } = useMatchBreakpoints()

  const columns = useColumnConfig()
  const { selectedProtocolIndex, selectedNetwork, selectedTokens, sortOrder, sortField, replaceURLQueriesByFilter } =
    useFilterToQueries()

  const [search] = useState('')
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
  const [isPoolListExtended, setIsPoolListExtended] = useState(false)

  // data source
  // const { extendPools, fetchPoolList, resetExtendPools } = useExtendPools()
  // we disabled extend pools in phase 1, we can turn it off later when we need
  const disabledExtendPools = false

  /* useEffect(() => {
    // if consumed, fetch from pool/list
    if (cursorVisible >= poolList.length && !disabledExtendPools) {
      fetchPoolList({
        chains: selectedNetwork,
        protocols: selectedProtocols,
        orderBy: PoolSortBy.VOL,
      })
    }
  }, [cursorVisible, poolList.length, fetchPoolList, selectedProtocols, disabledExtendPools, selectedNetwork]) */

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

  const handleToggleListExpand = useCallback(() => {
    setIsPoolListExtended(!isPoolListExtended)
  }, [isPoolListExtended])

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

  // const renderData = useMemo(() => sortedData.slice(0, cursorVisible), [cursorVisible, sortedData])

  const list = useAtomValue(
    farmsSearchAtom({
      keywords: '',
      chains: selectedNetwork,
      protocols: selectedProtocols,
      sortBy: sortField,
      sortOrder,
    }),
  )

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
              {!list.hasValue() && <StyledLoadingTable lines={20} />}
            </PoolsContent>
          </Suspense>
        </CardBody>
        {disabledExtendPools ? null : (
          <CardFooter>
            {isPoolListExtended ? <InfoIcon width="18px" color={theme.colors.textSubtle} /> : null}
            {isPoolListExtended ? t('Search has been extended') : t('Don’t see expected pools?')}
            <Button variant="text" scale="xs" onClick={handleToggleListExpand}>
              {isPoolListExtended ? t('Reset') : t('Extend the search')}
            </Button>
          </CardFooter>
        )}
      </Card>
    </FarmSearchContextProvider>
  )
}

const StyledLoadingTable = styled(LoadingTable)`
  min-height: calc(100vh - 64px - 56px);
`
