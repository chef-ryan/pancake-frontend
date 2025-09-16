import { UnifiedCurrency } from '@pancakeswap/swap-sdk-core'
import { AutoColumn, Row, TokenLogo, Text } from '@pancakeswap/uikit'
import { formatNumber } from '@pancakeswap/utils/formatNumber'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'

export const EarningsWithToken: React.FC<{
  currency: UnifiedCurrency
  earningsAmount: number
  earningsUsd: number
}> = ({ currency, earningsAmount, earningsUsd }) => {
  return (
    <AutoColumn>
      <Row gap="8px">
        <CurrencyLogo currency={currency} size="16px" />
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
