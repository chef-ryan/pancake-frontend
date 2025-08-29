import { useTranslation } from '@pancakeswap/localization'
import { Card, CardBody, FlexGap, Text } from '@pancakeswap/uikit'
import useTheme from 'hooks/useTheme'
import { useIFOCurrencies } from '../../hooks/ifo/useIFOCurrencies'
import useIfo from '../../hooks/useIfo'

export const IfoSaleDetailCard: React.FC = () => {
  const { t } = useTranslation()
  const { theme, isDark } = useTheme()
  const { offeringCurrency, stakeCurrency0, stakeCurrency1 } = useIFOCurrencies()
  const { info } = useIfo()
  const { pricePerTokens, raiseAmounts } = info

  const pools = [
    { currency: stakeCurrency0, price: pricePerTokens[0], raise: raiseAmounts[0] },
    { currency: stakeCurrency1, price: pricePerTokens[1], raise: raiseAmounts[1] },
  ].filter((p) => p.currency)

  return (
    <Card background={isDark ? '#18171A' : theme.colors.background} mb="16px">
      <CardBody>
        <Text fontSize="12px" bold color="secondary" lineHeight="18px" textTransform="uppercase">
          {t('Eligibility')}
        </Text>
        <Text mt="4px">{t('Anyone with $CAKE can join — our IFOs are open to all.')}</Text>
        <FlexGap flexDirection="column" gap="16px" mt="16px">
          {pools.map((pool) => (
            <FlexGap key={pool.currency?.symbol} flexDirection="column" gap="8px">
              <Text fontSize="12px" bold color="secondary" lineHeight="18px" textTransform="uppercase">
                {pool.currency?.symbol} {t('Pool')}
              </Text>
              <FlexGap justifyContent="space-between">
                <Text color="textSubtle">
                  {t('Sale Price per')} {offeringCurrency?.symbol ?? ''}
                </Text>
                <Text>
                  {pool.price?.toSignificant(6)} {pool.currency?.symbol ?? ''}
                </Text>
              </FlexGap>
              <FlexGap justifyContent="space-between">
                <Text color="textSubtle">{t('Target Raise')}</Text>
                <Text>
                  {pool.raise?.toSignificant(6)} {pool.currency?.symbol ?? ''}
                </Text>
              </FlexGap>
            </FlexGap>
          ))}
        </FlexGap>
      </CardBody>
    </Card>
  )
}

export default IfoSaleDetailCard
