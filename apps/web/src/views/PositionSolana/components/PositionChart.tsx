import { AutoColumn, AutoRow, Box, Card, CardBody, Flex, FlexGap, Spinner, Text } from '@pancakeswap/uikit'
import styled, { useTheme } from 'styled-components'
import { formatAmount } from '@pancakeswap/utils/formatInfoNumbers'
import { useCallback, useMemo, useState } from 'react'
import { Bar, BarChart, ResponsiveContainer, XAxis, ReferenceLine, ReferenceArea, Label } from 'recharts'
import { useSolanaV3PositionIdRouteParams } from 'hooks/dynamicRoute/usePositionIdRoute'
import { formatNumber } from '@pancakeswap/utils/formatNumber'
import { usePriceRange, usePriceRangeData } from 'hooks/solana/usePriceRange'
import { POSITION_STATUS, SolanaV3PositionDetail } from 'state/farmsV4/state/accountPositions/type'
import { SolanaV3Pool } from 'state/pools/solana'
import { TickUtils } from '@pancakeswap/solana-core-sdk'
import { useTranslation } from '@pancakeswap/localization'
import { usePoolCurrencies } from '../hooks/usePoolCurrencies'
import { usePoolChartData, ChartEntry } from '../hooks/usePoolChartData'

interface PositionChartProps {
  poolId: string
  position: SolanaV3PositionDetail
  poolInfo: SolanaV3Pool
  baseIn?: boolean
  priceLower?: number | string
  priceUpper?: number | string
  timePriceMin?: number
  timePriceMax?: number
  chartHeight?: number
  scale?: boolean
  onPriceRangeChange?: (lower: number, upper: number) => void
}

const maxRenderCount = 50

export const PositionChart = ({
  baseIn = true,
  position,
  poolInfo,
  chartHeight = 300,
  scale = true,
}: PositionChartProps) => {
  const { poolId } = useSolanaV3PositionIdRouteParams()
  const { symbol0, symbol1 } = usePoolCurrencies()
  const { t } = useTranslation()
  const { priceLower, priceUpper } = usePriceRange({
    tickLower: position.tickLower,
    tickUpper: position.tickUpper,
    baseIn: true,
    poolInfo,
  })
  const price = useMemo(() => {
    if (poolInfo.tickCurrent !== undefined && Number.isFinite(poolInfo.tickCurrent)) {
      return Number(
        TickUtils.getTickPrice({
          poolInfo,
          tick: poolInfo.tickCurrent!,
          baseIn,
        }).price.toFixed(18),
      )
    }
    return Number(poolInfo.price.toFixed(18))
  }, [poolInfo, baseIn])
  const { formattedData: chartData, isLoading, error } = usePoolChartData(poolId, baseIn)
  const theme = useTheme()
  const [lower, upper] = useMemo(() => {
    const lower = Number(priceLower?.toFixed(18)) < price ? priceLower : price
    const upper = Number(priceUpper?.toFixed(18)) > price ? priceUpper : price
    return [lower, upper]
  }, [priceLower, priceUpper, price])
  const formattedData = useMemo(() => {
    if (!chartData || chartData.length === 0) return []

    let filteredData = chartData

    if (scale && lower && upper && chartData.length > maxRenderCount) {
      const lowerPrice = Number(lower.toFixed(18))
      const upperPrice = Number(upper.toFixed(18))
      const range = upperPrice - lowerPrice
      const margin = range * 0.2

      const minPrice = lowerPrice - margin
      const maxPrice = upperPrice + margin

      filteredData = chartData.filter((item) => {
        const price = item.price0
        return price >= minPrice && price <= maxPrice
      })
    }

    filteredData.sort((a, b) => a.price0 - b.price0)

    return filteredData
  }, [chartData, price, scale, lower, upper])

  const [xLower, xCurrent, xUpper] = useMemo(() => {
    const { tickSpacing } = poolInfo.config
    return [
      formattedData.find((item) => item.tick === TickUtils.nearestUsableTick(position.tickLower, tickSpacing))?.price0,
      formattedData.find((item) => item.tick === TickUtils.nearestUsableTick(poolInfo.tickCurrent ?? 0, tickSpacing))
        ?.price0,
      formattedData.find((item) => item.tick === TickUtils.nearestUsableTick(position.tickUpper, tickSpacing))?.price0,
    ]
  }, [formattedData, poolInfo.tickCurrent, poolInfo.config.tickSpacing])

  const rangeColor = useMemo(() => {
    return position.status === POSITION_STATUS.ACTIVE ? theme.colors.success : theme.colors.failure
  }, [position.status, theme.colors.success, theme.colors.failure])

  if (isLoading) {
    return (
      <Card>
        <CardBody>
          <Flex height={`${chartHeight}px`} justifyContent="center" alignItems="center">
            <Spinner />
          </Flex>
        </CardBody>
      </Card>
    )
  }

  if (error || !formattedData.length) {
    return (
      <Card>
        <CardBody>
          <Flex height={`${chartHeight}px`} justifyContent="center" alignItems="center">
            <Text color="textSubtle">{error ? 'Failed to load chart data' : 'No liquidity data available'}</Text>
          </Flex>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardBody p={32}>
        <RangeBar
          lower={xLower}
          upper={xUpper}
          current={xCurrent}
          formattedData={formattedData}
          position={position}
          poolInfo={poolInfo}
          baseIn={baseIn}
        />
        <div style={{ position: 'relative', height: `${chartHeight}px` }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={formattedData}
              margin={{
                top: 20,
                right: 0,
                left: 0,
                bottom: 8,
              }}
            >
              <defs>
                <linearGradient id="liquidityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgba(118, 69, 217, 0.8)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="rgba(118, 69, 217, 0.3)" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="price0"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: theme.colors.textSubtle }}
                tickFormatter={(value) => formatAmount(value, { precision: 2 }) ?? ''}
              />

              {xCurrent && (
                <ReferenceLine x={xCurrent} stroke={theme.colors.secondary} strokeWidth={2}>
                  <Label
                    value={formatAmount(xCurrent, { precision: 2 }) ?? ''}
                    position="top"
                    style={{ fill: theme.colors.secondary, fontSize: '12px', fontWeight: 'bold' }}
                  />
                </ReferenceLine>
              )}
              {xLower && xUpper && <ReferenceArea x1={xLower} x2={xUpper} fill={rangeColor} fillOpacity={0.1} />}
              {xLower && (
                <ReferenceLine position="start" x={xLower} stroke={rangeColor} strokeWidth={2}>
                  {/* <Label
                    value={formatAmount(xLower, { precision: 2 }) ?? ''}
                    position="top"
                    style={{ fill: rangeColor, fontSize: '12px', fontWeight: 'bold' }}
                  /> */}
                </ReferenceLine>
              )}
              {xUpper && (
                <ReferenceLine position="end" x={xUpper} stroke={rangeColor} strokeWidth={2}>
                  {/* <Label
                    value={formatAmount(xUpper, { precision: 2 }) ?? ''}
                    position="top"
                    style={{ fill: rangeColor, fontSize: '12px', fontWeight: 'bold' }}
                  /> */}
                </ReferenceLine>
              )}

              <Bar dataKey="liquidity" fill="url(#liquidityGradient)" isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <AutoRow justifyContent="space-between">
          <FlexGap alignItems="center" gap="4px">
            <Box
              style={{
                width: '7px',
                height: '7px',
                left: '0px',
                top: '6px',
                background: theme.colors.secondary,
                borderRadius: '10px',
              }}
            />
            <Text fontSize="12px" lineHeight={1.5}>
              {t('Current Price')}{' '}
            </Text>
          </FlexGap>
          <FlexGap alignItems="center" gap="4px">
            <Text fontSize="12px" lineHeight={1.5} fontWeight={600}>
              {formatNumber(
                price,
                Number(price) < 1 ? { maximumDecimalTrailingZeroes: 4 } : { maxDecimalDisplayDigits: 4 },
              )}
            </Text>
            <Text fontSize="12px" lineHeight={1.5} color="textSubtle">
              {t('%subA% per %subB%', {
                subA: poolInfo.mintB.symbol,
                subB: poolInfo.mintA.symbol,
              })}
            </Text>
          </FlexGap>
        </AutoRow>
      </CardBody>
    </Card>
  )
}

const RangeBar = ({ lower, upper, current, formattedData, position, poolInfo, baseIn }) => {
  const min = formattedData[0].price0
  const max = formattedData[formattedData.length - 1].price0
  const scaled = formattedData.length > maxRenderCount
  const [xLower, xCurrent, xUpper] = useMemo(() => {
    const { tickSpacing } = poolInfo.config
    return [
      formattedData.findIndex((item) => item.tick === TickUtils.nearestUsableTick(position.tickLower, tickSpacing)),
      formattedData.findIndex(
        (item) => item.tick === TickUtils.nearestUsableTick(poolInfo.tickCurrent ?? 0, tickSpacing),
      ),
      formattedData.findIndex((item) => item.tick === TickUtils.nearestUsableTick(position.tickUpper, tickSpacing)),
    ]
  }, [formattedData, poolInfo.tickCurrent, poolInfo.config.tickSpacing])

  const currentLeft = useMemo(() => {
    if (scaled) return ((current - min) / (max - min)) * 100
    return (xCurrent / formattedData.length) * 100
  }, [current, min, max, scaled, xCurrent])
  const lowerLeft = useMemo(() => {
    if (scaled) return ((lower - min) / (max - min)) * 100
    return (Math.max(0, xLower) / formattedData.length) * 100
  }, [lower, min, max, scaled, xLower])
  const upperRight = useMemo(() => {
    if (scaled) return ((upper - min) / (max - min)) * 100
    return (Math.min(formattedData.length, xUpper + 1) / formattedData.length) * 100
  }, [upper, min, max, scaled, xUpper])
  const {
    minPriceFormatted: minPrice,
    minPercentage,
    maxPriceFormatted: maxPrice,
    maxPercentage,
  } = usePriceRangeData({
    tickLower: position.tickLower,
    tickUpper: position.tickUpper,
    baseIn,
    poolInfo,
  })
  const displayMinPrice =
    minPrice !== '0'
      ? formatNumber(
          minPrice,
          Number(minPrice) < 1 ? { maximumDecimalTrailingZeroes: 4 } : { maxDecimalDisplayDigits: 4 },
        )
      : '0'
  const displayMaxPrice =
    maxPrice !== '∞'
      ? formatNumber(
          maxPrice,
          Number(maxPrice) < 1 ? { maximumDecimalTrailingZeroes: 4 } : { maxDecimalDisplayDigits: 4 },
        )
      : '∞'
  const isSmallRange = upperRight - lowerLeft < 20
  return (
    <AutoColumn width="100%" py="8px" gap="4px">
      <Box width="100%" position="relative" height="30px">
        <PriceRangeContainer
          left={isSmallRange ? Math.max(0, lowerLeft - 10) : lowerLeft}
          right={isSmallRange ? Math.min(100, upperRight + 10) : upperRight}
        >
          <AutoRow justifyContent="space-between">
            <AutoColumn alignItems="flex-start">
              <Text fontSize="12px" lineHeight={1.5} fontWeight={600}>
                {displayMinPrice}
              </Text>
              <Text fontSize="10px" color="textSubtle">
                {minPercentage}
              </Text>
            </AutoColumn>

            <AutoColumn alignItems="flex-end">
              <Text fontSize="12px" lineHeight={1.5} fontWeight={600}>
                {displayMaxPrice}
              </Text>
              <Text fontSize="10px" color="textSubtle" textAlign="right">
                {maxPercentage}
              </Text>
            </AutoColumn>
          </AutoRow>
        </PriceRangeContainer>
      </Box>
      <Box width="100%" position="relative">
        <TrackerBar />
        <PriceRangeBar left={lowerLeft} right={upperRight} inRange={position.status === POSITION_STATUS.ACTIVE} />
        <CurrentPin left={currentLeft} />
      </Box>
    </AutoColumn>
  )
}

const TrackerBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 5px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.disabled};
  border: 0.5px solid ${({ theme }) => theme.colors.inputSecondary};
`

const CurrentPin = styled.div<{ left: number }>`
  position: absolute;
  top: -2px;
  left: ${({ left }) => left + 1}%;
  width: 5px;
  height: 12px;
  border-radius: 16px;
  background: ${({ theme }) => theme.colors.secondary};

  &:before {
    background-image: url(data:image/svg+xml,%3Csvg%20width%3D%227%22%20height%3D%227%22%20viewBox%3D%220%200%207%207%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M1.14844%202.4598C0.803786%201.79417%201.28689%201%202.03646%201H4.96209C5.71165%201%206.19476%201.79417%205.85011%202.4598L4.38729%205.28495C4.01435%206.00522%202.98419%206.00522%202.61125%205.28495L1.14844%202.4598Z%22%20fill%3D%22%237645D9%22%20stroke%3D%22white%22%2F%3E%3C%2Fsvg%3E);
    background-size: cover;
    background-repeat: no-repeat;
    content: '';
    position: absolute;
    top: -5px;
    left: -1px;
    width: 7px;
    height: 6px;
  }
`

const PriceRangeBar = styled.div<{ left: number; right: number; inRange: boolean }>`
  position: absolute;
  top: 0;
  left: ${({ left }) => left + 1}%;
  width: ${({ right, left }) => right - left}%;
  height: 5px;
  border-radius: 8px;
  background: ${({ theme, inRange }) => (inRange ? theme.colors.success : theme.colors.failure)};
`
const PriceRangeContainer = styled.div<{ left: number; right: number }>`
  position: absolute;
  height: 30px;
  top: 0;
  left: ${({ left }) => left + 1}%;
  width: ${({ right, left }) => right - left}%;
`
