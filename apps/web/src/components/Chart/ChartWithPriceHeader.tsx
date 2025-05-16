import { Currency } from '@pancakeswap/sdk'
import { Box } from '@pancakeswap/uikit'
import React from 'react'
import { styled } from 'styled-components'
import PriceHeader from './PriceHeader'
import TradingViewChart from './TradingViewChart'

interface ChartWithPriceHeaderProps {
  symbol?: string
  price?: string
  priceChange?: string
  priceChangePercent?: string
  high24h?: string
  low24h?: string
  isPositive?: boolean
  currency0?: Currency
  currency1?: Currency
  theme?: 'Light' | 'Dark'
}

const Container = styled(Box)`
  width: 100%;
  height: 100%;
  border-radius: 16px;
  background: ${({ theme }) => theme.card.background};
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  ${({ theme }) => theme.mediaQueries.md} {
    height: fit-content;
    margin-left: 40px;
  }
`

const ChartWithPriceHeader: React.FC<ChartWithPriceHeaderProps> = ({
  symbol = 'CAKE/BNB',
  price = '0.0052863',
  priceChange = '-0.01',
  priceChangePercent = '-0.01%',
  high24h = '0.0053863',
  low24h = '0.0051863',
  isPositive = false,
  currency0,
  currency1,
  theme = 'Dark',
}) => {
  return (
    <Container>
      <PriceHeader
        symbol={symbol}
        price={price}
        priceChange={priceChange}
        priceChangePercent={priceChangePercent}
        high24h={high24h}
        low24h={low24h}
        isPositive={isPositive}
        currency0={currency0}
        currency1={currency1}
      />
      <TradingViewChart theme={theme} />
    </Container>
  )
}

export default ChartWithPriceHeader
