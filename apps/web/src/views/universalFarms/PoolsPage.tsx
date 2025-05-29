import { useIntersectionObserver, useTheme } from '@pancakeswap/hooks'
import { useTranslation } from '@pancakeswap/localization'
import { Button, InfoIcon, SORT_ORDER, TableView, useMatchBreakpoints } from '@pancakeswap/uikit'
import { useAllTokensByChainIds } from 'hooks/Tokens'
import { useRouter } from 'next/router'
import { Suspense, useCallback, useMemo, useState } from 'react'
import { usePoolsApr } from 'state/farmsV4/hooks'
import styled from 'styled-components'

import { ChainId } from '@pancakeswap/chains'
import { FarmInfo } from 'edge/farm/farm.util'
import { useAtomValue } from 'jotai'
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
import { useFilterToQueries } from './hooks/useFilterToQueries'
import { useAllChainIds } from './hooks/useMultiChains'

const PoolsContent = styled.div`
  min-height: calc(100vh - 64px - 56px);
`

const NUMBER_OF_FARMS_VISIBLE = 20

export const PoolsPage = () => {
  const nextRouter = useRouter()
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { isMobile, isMd } = useMatchBreakpoints()

  const columns = useColumnConfig()
  const allChainIds = useAllChainIds()
  const { selectedProtocolIndex, selectedNetwork, selectedTokens, sortOrder, sortField, replaceURLQueriesByFilter } =
    useFilterToQueries()

  const [search, setSearch] = useState('')
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
  const [cursorVisible, setCursorVisible] = useState(NUMBER_OF_FARMS_VISIBLE)
  const [isPoolListExtended, setIsPoolListExtended] = useState(false)

  // data source
  // const { extendPools, fetchPoolList, resetExtendPools } = useExtendPools()
  const allTokenMap = useAllTokensByChainIds(allChainIds)
  const poolsApr = usePoolsApr()
  // we disabled extend pools in phase 1, we can turn it off later when we need
  const disabledExtendPools = false
  const EMPTY_POOLS = useMemo(() => [], [])

  const [nextPage, setNextPage] = useState(1)

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
    async (farm: FarmInfo) => {
      const data = await getPoolDetailPageLink(farm.poolInfo!)
      nextRouter.push(data)
    },
    [nextRouter],
  )

  const getRowKey = useCallback((item: FarmInfo) => {
    return [item.chainId, item.id]
  }, [])

  // const renderData = useMemo(() => sortedData.slice(0, cursorVisible), [cursorVisible, sortedData])
  console.log('[query]', selectedProtocols)
  const list = useAtomValue(
    farmsSearchAtom({
      chains: [ChainId.BSC],
      protocols: selectedProtocols,
    }),
  )

  return (
    <Card>
      <CardHeader p={isMobile ? '16px' : undefined}>
        <PoolsFilterPanel onChange={handleFilterChange} value={poolsFilter}>
          {(isMobile || isMd) && <AddLiquidityButton height="40px" scale="sm" width="100%" />}
        </PoolsFilterPanel>
      </CardHeader>
      <CardBody
        style={{
          opacity: list.isPending() ? 0.5 : 1,
        }}
      >
        <Suspense>
          <PoolsContent>
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
  )
}
