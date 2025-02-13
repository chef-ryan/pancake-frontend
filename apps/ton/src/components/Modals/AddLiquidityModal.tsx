import { useTranslation } from '@pancakeswap/localization'
import { Currency } from '@pancakeswap/ton-v2-sdk'
import { Button, Flex, FlexGap, Text } from '@pancakeswap/uikit'
import { settingsAtom } from 'atoms/settings/settingsAtom'
import { LightGreyCard } from 'components/Card'
import { CurrencyLogo, DoubleCurrencyLogo } from 'components/widgets'
import { NumberDisplay } from 'components/widgets/NumberDisplay'
import { useAtomValue } from 'jotai'
import styled from 'styled-components'

const StyledFlexGap = styled(FlexGap).attrs({ flexDirection: 'column' })`
  min-height: 160px;
`

export interface AddLiquidityModalProps {
  currency0?: Currency
  currency1?: Currency
  amount0?: string
  amount1?: string
  outputAmount?: string
  rate0?: string
  rate1?: string
  shareInPool?: string
  onConfirm?: () => void
}

export const AddLiquidityModal = ({
  currency0,
  currency1,
  outputAmount,
  amount0,
  amount1,
  rate0,
  rate1,
  shareInPool,
  onConfirm,
}: AddLiquidityModalProps) => {
  const { t } = useTranslation()
  const settings = useAtomValue(settingsAtom)
  const { slippage } = settings

  return (
    <StyledFlexGap gap="8px">
      <Text color="textSubtle">{t('You will receive')}</Text>
      <LightGreyCard>
        <Flex justifyContent="space-between">
          <FlexGap gap="8px">
            <DoubleCurrencyLogo currency0={currency0} currency1={currency1} />
            <Text bold>
              {currency0?.symbol}-{currency1?.symbol} LP
            </Text>
          </FlexGap>
          <NumberDisplay value={outputAmount} bold />
        </Flex>
      </LightGreyCard>

      <Text mt="8px" color="textSubtle">
        {t('Your deposit')}
      </Text>
      <LightGreyCard>
        <FlexGap flexDirection="column" gap="8px">
          <Flex justifyContent="space-between">
            <FlexGap gap="8px">
              <CurrencyLogo currency={currency0} />
              <Text bold>{currency0?.symbol}</Text>
            </FlexGap>
            <NumberDisplay value={amount0} bold />
          </Flex>
          <Flex justifyContent="space-between">
            <FlexGap gap="8px">
              <CurrencyLogo currency={currency1} />
              <Text bold>{currency1?.symbol}</Text>
            </FlexGap>
            <NumberDisplay value={amount1} bold />
          </Flex>
        </FlexGap>
      </LightGreyCard>

      <Flex mt="8px" justifyContent="space-between">
        <Text color="textSubtle">{t('Rates')}</Text>
        <Flex flexDirection="column">
          <Text>
            1 {currency0?.symbol} ≈ {rate0} {currency1?.symbol}
          </Text>
          <Text>
            1 {currency1?.symbol} ≈ {rate1} {currency0?.symbol}
          </Text>
        </Flex>
      </Flex>
      <Flex justifyContent="space-between">
        <Text color="textSubtle">{t('Your share in the pair')}</Text>
        <NumberDisplay value={shareInPool} suffix="%" maximumSignificantDigits={6} />
      </Flex>

      <Flex justifyContent="space-between" alignItems="center">
        <Text color="textSubtle">{t('Slippage Tolerance')}</Text>
        <Text>{slippage}%</Text>
      </Flex>

      <Button mt="8px" onClick={onConfirm}>
        {t('Confirm Supply')}
      </Button>
    </StyledFlexGap>
  )
}
