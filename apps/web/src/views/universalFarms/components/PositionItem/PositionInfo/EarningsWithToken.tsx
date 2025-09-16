import { UnifiedCurrency } from '@pancakeswap/swap-sdk-core'
import { AutoColumn, Row, TokenLogo, Text } from '@pancakeswap/uikit'
import { formatNumber } from '@pancakeswap/utils/formatNumber'
import styled from 'styled-components'
import { getCurrencyLogoSrcs } from 'utils/tokenImages'

const TokenAvatar = styled(TokenLogo)`
  width: 16px;
  height: 16px;
  border-radius: 50%;
`

export const EarningsWithToken: React.FC<{
  currency: UnifiedCurrency
  earningsAmount: number
  earningsUsd: number
}> = ({ currency, earningsAmount, earningsUsd }) => {
  return (
    <AutoColumn>
      <Row gap="8px">
        <TokenAvatar srcs={getCurrencyLogoSrcs(currency)} />
        <Text fontSize="12px" color="textSubtle">
          {formatNumber(earningsAmount)}
        </Text>
        <Text fontSize="12px" color="textSubtle" fontWeight={600}>
          {' '}
          {currency.symbol}{' '}
        </Text>
      </Row>
      <Row gap="8px" justifyContent="flex-end">
        <Text fontSize="12px" color="textSubtle">
          ~${formatNumber(earningsUsd)}
        </Text>
      </Row>
    </AutoColumn>
  )
}
