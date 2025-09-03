import { useTranslation } from '@pancakeswap/localization'
import { Card, CardBody, FlexGap, Text } from '@pancakeswap/uikit'
import { CurrencyLogo, DoubleCurrencyLogo, NumberDisplay } from '@pancakeswap/widgets-internal'
import useTheme from 'hooks/useTheme'
import { StyledLogo } from '../Icons'
import useIfo from '../../hooks/useIfo'
import { useIfoDisplay } from '../../hooks/useIfoDisplay'

export const IfoSaleInfoCard: React.FC = () => {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const { config, info, pools } = useIfo()
  const stakeCurrency0 = pools?.[0]?.stakeCurrency
  const stakeCurrency1 = pools?.[1]?.stakeCurrency
  const { icon } = config ?? {}
  const { preSaleDurationText } = useIfoDisplay()
  if (!info) {
    return null
  }
  const { offeringCurrency, totalSalesAmount, status } = info

  const SubscribeInfo = () => (
    <FlexGap
      alignItems="center"
      gap="8px"
      mt="16px"
      p="8px"
      borderRadius="16px"
      border={`1px solid ${theme.colors.cardBorder}`}
      background={theme.colors.cardSecondary}
    >
      {stakeCurrency0 && stakeCurrency1 ? (
        <DoubleCurrencyLogo size={40} currency0={stakeCurrency0} currency1={stakeCurrency1} />
      ) : stakeCurrency0 || stakeCurrency1 ? (
        <CurrencyLogo size="40px" currency={stakeCurrency0 ?? stakeCurrency1} />
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
  )

  const FinishedInfo = () => (
    <FlexGap
      alignItems="center"
      gap="8px"
      mt="16px"
      p="8px"
      borderRadius="16px"
      border={`1px solid ${theme.colors.cardBorder}`}
    >
      {stakeCurrency0 && stakeCurrency1 ? (
        <DoubleCurrencyLogo size={40} currency0={stakeCurrency0} currency1={stakeCurrency1} />
      ) : stakeCurrency0 || stakeCurrency1 ? (
        <CurrencyLogo size="40px" currency={stakeCurrency0 ?? stakeCurrency1} />
      ) : null}
      <Text color="textSubtle">{t('Sale finished')}</Text>
    </FlexGap>
  )

  return (
    <Card background={theme.colors.card} mb="16px">
      <CardBody>
        <Text fontSize="12px" bold color="secondary" lineHeight="18px" textTransform="uppercase">
          {t('Total Sale')}
        </Text>
        <FlexGap mt="8px" gap="8px" alignItems="center" background={theme.colors.white}>
          {icon && <StyledLogo size="40px" srcs={[icon]} />}
          <FlexGap flexDirection="column">
            <NumberDisplay
              bold
              fontSize="20px"
              lineHeight="30px"
              value={totalSalesAmount?.toSignificant(6)}
              suffix={` ${offeringCurrency?.symbol}`}
            />
            <Text color="textSubtle">{`${preSaleDurationText} ${t('Project Duration')}`}</Text>
          </FlexGap>
        </FlexGap>
        {status !== 'finished' ? <SubscribeInfo /> : <FinishedInfo />}
      </CardBody>
    </Card>
  )
}
