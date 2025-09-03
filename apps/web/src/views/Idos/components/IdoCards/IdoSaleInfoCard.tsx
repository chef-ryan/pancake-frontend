import { useTranslation } from '@pancakeswap/localization'
import { Card, CardBody, FlexGap, Text } from '@pancakeswap/uikit'
import { NumberDisplay } from '@pancakeswap/widgets-internal'
import useTheme from 'hooks/useTheme'
import { StyledLogo } from 'views/Idos/components/Icons'
import { useCurrentIDOConfig } from 'views/Idos/hooks/ido/useCurrentIDOConfig'
import { useIDOConfig } from 'views/Idos/hooks/ido/useIDOConfig'
import { useIDOCurrencies } from 'views/Idos/hooks/ido/useIDOCurrencies'
import { useIDODuration } from 'views/Idos/hooks/ido/useIDODuration'

export const IdoSaleInfoCard: React.FC = () => {
  const { t } = useTranslation()
  const { theme, isDark } = useTheme()
  const { offeringCurrency, stakeCurrency0, stakeCurrency1 } = useIDOCurrencies()
  const { totalSalesAmount, status, duration } = useIDOConfig()
  const { icon } = useCurrentIDOConfig() ?? {}
  const preSaleDurationText = useIDODuration(duration)

  return (
    <Card background={isDark ? '#18171A' : theme.colors.background} mb="16px">
      <CardBody>
        <Text fontSize="12px" bold color="secondary" lineHeight="18px" textTransform="uppercase">
          {t('Total Sale')}
        </Text>
        <FlexGap
          mt="8px"
          gap="8px"
          alignItems="center"
          background={theme.colors.cardSecondary}
          borderRadius="16px"
          p="8px"
          border={`1px solid ${theme.colors.cardBorder}`}
        >
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
        {status !== 'finished' && (
          <Text color="textSubtle" mt="16px">
            {stakeCurrency0 && stakeCurrency1
              ? t('You can subscribe to the sale by depositing %stakeCurrency0% and %stakeCurrency1% half in ratio.', {
                  stakeCurrency0: stakeCurrency0.symbol,
                  stakeCurrency1: stakeCurrency1.symbol,
                })
              : stakeCurrency0 || stakeCurrency1
              ? t('You can subscribe to the sale by depositing %stakeCurrency%.', {
                  stakeCurrency: stakeCurrency0?.symbol ?? stakeCurrency1?.symbol,
                })
              : null}
          </Text>
        )}
      </CardBody>
    </Card>
  )
}
