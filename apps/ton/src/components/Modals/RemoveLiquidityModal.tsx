import { useTranslation } from '@pancakeswap/localization'
import { Currency } from '@pancakeswap/ton-v2-sdk'
import { AddIcon, Button, Flex, FlexGap, Grid, Text } from '@pancakeswap/uikit'
import { LightGreyCard } from 'components/Card'
import { CurrencyLogo, DoubleCurrencyLogo } from 'components/widgets'
import { NumberDisplay } from 'components/widgets/NumberDisplay'
import { useUserSlippage } from 'hooks/useUserSlippage'
import styled from 'styled-components'
import { Hr } from 'styles'

const StyledFlexGap = styled(FlexGap).attrs({ flexDirection: 'column' })`
  min-height: 160px;
`

const GridColumn = styled(FlexGap)`
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 8px;
`

export interface RemoveLiquidityModalProps {
  currency0?: Currency
  currency1?: Currency
  amount0?: string
  amount1?: string
  tokenBurnAmount?: string
  onConfirm?: () => void
}

export const RemoveLiquidityModal = ({
  currency0,
  currency1,
  amount0,
  amount1,
  tokenBurnAmount,
  onConfirm,
}: RemoveLiquidityModalProps) => {
  const { t } = useTranslation()
  const [slippage] = useUserSlippage()

  return (
    <StyledFlexGap gap="8px" maxWidth={[null, null, null, '400px']}>
      <Text textAlign="center" fontSize="20px" bold>
        {t('You will receive')}
      </Text>
      <Grid mt="16px" px="16px" gridTemplateColumns="1fr 1fr 1fr">
        <GridColumn>
          <CurrencyLogo currency={currency0} size="40px" />
          <FlexGap justifyContent="center" alignItems="center" gap="4px">
            <NumberDisplay value={amount0} maximumSignificantDigits={6} fontSize={['12px', '14px', '20px']} bold />
            <Text fontSize={['12px', '14px', '20px']} bold>
              {currency0?.symbol}
            </Text>
          </FlexGap>
        </GridColumn>
        <GridColumn>
          <AddIcon width="24px" />
        </GridColumn>
        <GridColumn>
          <CurrencyLogo currency={currency1} size="40px" />
          <FlexGap justifyContent="center" alignItems="center" gap="4px">
            <NumberDisplay value={amount1} maximumSignificantDigits={6} fontSize={['12px', '14px', '20px']} bold />
            <Text fontSize={['12px', '14px', '20px']} bold>
              {currency1?.symbol}
            </Text>
          </FlexGap>
        </GridColumn>
      </Grid>

      <LightGreyCard mt="16px">
        <Text color="textSubtle" fontSize={['14px', '20px']}>
          {t('Output is estimated. If the price changes by more than %slippage%% your transaction will revert.', {
            slippage: slippage / 100,
          })}
        </Text>
        <Hr />
        <Flex mt="16px" justifyContent="space-between" flexWrap="wrap">
          <FlexGap gap="8px" flexWrap="wrap">
            <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={24} overlap />
            <Text color="textSubtle" fontSize={['14px', '20px']}>
              {t('%currency0%/%currency1% Burned', {
                currency0: currency0?.symbol,
                currency1: currency1?.symbol,
              })}
            </Text>
          </FlexGap>
          <NumberDisplay
            value={tokenBurnAmount}
            color="textSubtle"
            fontSize={['14px', '20px']}
            maximumSignificantDigits={12}
          />
        </Flex>
      </LightGreyCard>

      <Button mt="8px" minHeight="48px" onClick={onConfirm}>
        {t('Continue')}
      </Button>
    </StyledFlexGap>
  )
}
