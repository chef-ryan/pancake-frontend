import { useTranslation } from '@pancakeswap/localization'
import { Box, FlexGap, Text } from '@pancakeswap/uikit'
import { CurrencyLogo } from 'components/widgets'
import { NumberDisplay } from 'components/widgets/NumberDisplay'
import Link from 'next/link'
import styled from 'styled-components'

const StyledFlexGap = styled(FlexGap).attrs({ flexDirection: 'column' })`
  text-align: center;
  min-height: 160px;
`

export enum TransactionActionType {
  TransactionSubmitted = 'TransactionSubmitted',
  TransactionComplete = 'TransactionComplete',
}

interface ActionProps {
  currency0?: string
  currency1?: string
  amount0?: string
  amount1?: string

  hash?: string
  type?: TransactionActionType
}

export const ActionModal = ({ currency0, currency1, amount0, amount1, hash, type }: ActionProps) => {
  const { t } = useTranslation()

  return (
    <StyledFlexGap gap="8px">
      <FlexGap justifyContent="space-around" alignItems="center">
        <Box>
          <CurrencyLogo
            currency={{
              logoURI: '',
            }}
            size="40px"
          />
          <FlexGap justifyContent="center" alignItems="center" gap="4px">
            <NumberDisplay value={amount0} fontSize="24px" bold />
            <Text fontSize="24px" bold>
              {currency0}
            </Text>
          </FlexGap>
        </Box>
        <Box>
          {type === 'TransactionSubmitted' ? (
            <img src="/images/up-arrow-animated.gif" alt="Up Arrow" width="80px" />
          ) : (
            <img src="/images/green-tick-animated.gif" alt="Green Tick" width="80px" />
          )}
        </Box>
        <Box>
          <CurrencyLogo
            currency={{
              logoURI: '',
            }}
            size="40px"
          />
          <FlexGap justifyContent="center" alignItems="center" gap="4px">
            <NumberDisplay value={amount1} fontSize="24px" bold />
            <Text fontSize="24px" bold>
              {currency1}
            </Text>
          </FlexGap>
        </Box>
      </FlexGap>

      <Box mt="auto">
        <Text color="primary60">
          <Link href={`GET EXPLORER LINK ${hash}`} target="_blank">
            {t('View on explorer:')} {hash}
          </Link>
        </Text>
      </Box>
    </StyledFlexGap>
  )
}
