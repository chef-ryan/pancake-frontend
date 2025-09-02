import { useTranslation } from '@pancakeswap/localization'
import { Card, CardBody, FlexGap, Text } from '@pancakeswap/uikit'
import getTimePeriods from '@pancakeswap/utils/getTimePeriods'
import { CurrencyLogo, DoubleCurrencyLogo, NumberDisplay } from '@pancakeswap/widgets-internal'
import useTheme from 'hooks/useTheme'
import { useMemo } from 'react'
import { StyledLogo } from '../Icons'
import { useIFOCurrencies } from '../../hooks/ifo/useIFOCurrencies'
import { useIFODuration } from '../../hooks/ifo/useIFODuration'
import useIfo from '../../hooks/useIfo'
import { useIfoTimeDisplay } from '../../hooks/ifo/useIfoTimeDisplay'

export const IfoSaleInfoCard: React.FC = () => {
  const { t } = useTranslation()
  const { theme, isDark } = useTheme()
  const { offeringCurrency, stakeCurrency0, stakeCurrency1 } = useIFOCurrencies()
  const { config, info } = useIfo()
  const { totalSalesAmount, status, duration, startTimestamp, endTimestamp } = info
  const { icon } = config ?? {}
  const preSaleDurationText = useIFODuration(duration)
  const startDisplay = useIfoTimeDisplay(startTimestamp)
  const endDisplay = useIfoTimeDisplay(endTimestamp)

  const durationText = useMemo(() => {
    if (status !== 'finished') {
      return preSaleDurationText
    }

    const { days } = getTimePeriods(duration)
    if (days < 1) {
      return (
        <>
          {startDisplay.date}
          <br />
          {startDisplay.time} - {endDisplay.time} (UTC+8)
        </>
      )
    }

    return (
      <>
        {startDisplay.date} {t('to')} <br />
        {endDisplay.date}
      </>
    )
  }, [duration, endDisplay.date, endDisplay.time, preSaleDurationText, startDisplay.date, startDisplay.time, status, t])

  return (
    <Card background={isDark ? '#18171A' : theme.colors.background} mb="16px">
      <CardBody>
        <FlexGap gap="8px">
          {icon && <StyledLogo size="40px" srcs={[icon]} />}
          <FlexGap flexDirection="column">
            <Text fontSize="12px" bold color="secondary" lineHeight="18px" textTransform="uppercase">
              {t('Total Sale')}
            </Text>
            <NumberDisplay
              bold
              fontSize="20px"
              lineHeight="30px"
              value={totalSalesAmount?.toSignificant(6)}
              suffix={` ${offeringCurrency?.symbol}`}
            />
          </FlexGap>
        </FlexGap>
        <FlexGap flexDirection="column" gap="8px" mt="16px">
          <FlexGap justifyContent="space-between">
            <Text color="textSubtle" style={{ whiteSpace: 'nowrap' }}>
              {t('Project Duration')}
            </Text>
            <Text textAlign="right">{durationText}</Text>
          </FlexGap>
        </FlexGap>
        {status !== 'finished' && (
          <FlexGap alignItems="center" gap="8px" mt="16px">
            {stakeCurrency0 && stakeCurrency1 ? (
              <DoubleCurrencyLogo size={20} currency0={stakeCurrency0} currency1={stakeCurrency1} />
            ) : stakeCurrency0 || stakeCurrency1 ? (
              <CurrencyLogo size="20px" currency={stakeCurrency0 ?? stakeCurrency1} />
            ) : null}
            <Text color="textSubtle">
              {stakeCurrency0 && stakeCurrency1
                ? t('Subscribe to the sale by depositing %stakeCurrency0% & %stakeCurrency1% in a 1:1 ratio.', {
                    stakeCurrency0: stakeCurrency0.symbol,
                    stakeCurrency1: stakeCurrency1.symbol,
                  })
                : stakeCurrency0 || stakeCurrency1
                ? t('Subscribe to the sale by depositing %stakeCurrency%.', {
                    stakeCurrency: stakeCurrency0?.symbol ?? stakeCurrency1?.symbol,
                  })
                : null}
            </Text>
          </FlexGap>
        )}
      </CardBody>
    </Card>
  )
}
