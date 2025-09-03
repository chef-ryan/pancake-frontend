import { useTranslation } from '@pancakeswap/localization'
import { Card, CardBody, FlexGap, Text, CheckmarkCircleFillIcon } from '@pancakeswap/uikit'
import useTheme from 'hooks/useTheme'
import useIfo from '../../hooks/useIfo'

export const IfoSaleDetailCard: React.FC = () => {
  const { t } = useTranslation()
  const { theme, isDark } = useTheme()
  const { info, pools } = useIfo()
  const stakeSymbols = pools.map((pool) => pool.stakeCurrency?.symbol).filter(Boolean) as string[]
  const joinSymbols = stakeSymbols.length === 2 ? `${stakeSymbols[0]} & ${stakeSymbols[1]}` : stakeSymbols[0]

  return (
    <Card background={isDark ? '#18171A' : theme.colors.background} mb="16px">
      <CardBody>
        <FlexGap alignItems="center" gap="8px">
          <CheckmarkCircleFillIcon color={theme.colors.success} width="20px" />
          <Text color="success">
            {t('Anyone with %symbol% can join — our IFOs are open to all.', { symbol: joinSymbols })}
          </Text>
        </FlexGap>
        <FlexGap flexDirection="column" gap="16px" mt="16px">
          {pools.map((pool) => (
            <FlexGap key={pool.pid} flexDirection="column" gap="8px">
              <Text fontSize="12px" bold color="secondary" lineHeight="18px" textTransform="uppercase">
                {pool.stakeCurrency?.symbol} {t('Pool')}
              </Text>
              <FlexGap justifyContent="space-between">
                <Text color="textSubtle">{t('Sale Price per token')}</Text>
                <Text>
                  {pool.price?.toSignificant(6)} {pool.stakeCurrency?.symbol ?? ''}
                </Text>
              </FlexGap>
              <FlexGap justifyContent="space-between">
                <Text color="textSubtle">{t('Target Raise')}</Text>
                <Text>
                  {pool.raise?.toSignificant(6)} {pool.stakeCurrency?.symbol ?? ''}
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
