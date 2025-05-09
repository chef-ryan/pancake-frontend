import React from 'react'
import { styled } from 'styled-components'
import { Flex, Text, Box, FlexGap } from '@pancakeswap/uikit'
import { DoubleCurrencyLogo } from 'components/Logo'
import { Currency } from '@pancakeswap/sdk'

interface PriceHeaderProps {
  symbol?: string
  price?: string
  priceChange?: string
  priceChangePercent?: string
  high24h?: string
  low24h?: string
  isPositive?: boolean
  currency0?: Currency
  currency1?: Currency
}

const Container = styled(Flex)`
  width: 100%;
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 16px 16px 0 0;
  padding: 12px 16px;
  align-items: center;
  justify-content: space-between;
`

const TokenSymbol = styled(Flex)`
  align-items: center;
  gap: 8px;
`

const PriceInfo = styled(Flex)`
  align-items: center;
  gap: 16px;

  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }
`

const PriceText = styled(Text)`
  font-size: 24px;
  font-weight: 600;

  @media (max-width: 576px) {
    font-size: 20px;
  }
`

const PriceChange = styled(Text)<{ isPositive: boolean }>`
  color: ${({ isPositive, theme }) => (isPositive ? theme.colors.success : theme.colors.failure)};
  font-size: 14px;
  font-weight: 600;
`

const StatItem = styled(Flex)`
  flex-direction: column;
  align-items: center;

  @media (max-width: 768px) {
    display: none;
  }
`

const PriceHeader: React.FC<PriceHeaderProps> = ({
  symbol = 'CAKE/BNB',
  price = '0.0052863',
  priceChange = '-0.01',
  priceChangePercent = '-0.01%',
  high24h = '0.0053863',
  low24h = '0.0051863',
  isPositive = false,
  currency0,
  currency1,
}) => {
  // 分割符號以獲取幣種名稱
  const [baseCurrency, quoteCurrency] = symbol.split('/')

  return (
    <Container>
      <TokenSymbol>
        <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={24} margin />
        <Text bold fontSize="18px">
          {symbol}
        </Text>
      </TokenSymbol>

      <PriceInfo>
        <PriceText>{price}</PriceText>
        <PriceChange isPositive={isPositive}>
          {priceChange} ({priceChangePercent})
        </PriceChange>

        <FlexGap gap="16px">
          <StatItem>
            <Text fontSize="12px" color="textSubtle">
              24h High
            </Text>
            <Text bold>{high24h}</Text>
          </StatItem>

          <StatItem>
            <Text fontSize="12px" color="textSubtle">
              24h Low
            </Text>
            <Text bold>{low24h}</Text>
          </StatItem>
        </FlexGap>
      </PriceInfo>
    </Container>
  )
}

export default PriceHeader
