import { useTranslation } from '@pancakeswap/localization'
import { Card, CardBody, CardHeader, FlexGap, Text } from '@pancakeswap/uikit'
import useTheme from 'hooks/useTheme'
import { styled } from 'styled-components'
import { useIFOCurrencies } from '../../hooks/ifo/useIFOCurrencies'

const Timeline = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  margin: 24px 0;
  &:before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background-color: ${({ theme }) => theme.colors.cardBorder};
  }
`

const Milestone = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
`

const Dot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 8px;
`

export const VestingScheduleCard: React.FC = () => {
  const { t } = useTranslation()
  const { theme, isDark } = useTheme()
  const { offeringCurrency } = useIFOCurrencies()

  return (
    <Card background={isDark ? '#18171A' : theme.colors.background} mb="16px">
      <CardHeader>
        <Text fontSize="20px" bold>
          {`${offeringCurrency?.symbol ?? ''} ${t('VESTING SCHEDULE')}`}
        </Text>
      </CardHeader>
      <CardBody>
        <FlexGap flexDirection="column" gap="8px">
          <Timeline>
            <Milestone>
              <Dot />
              <Text fontSize="12px" bold>
                {t('IFO ENDED')}
              </Text>
              <Text fontSize="12px" color="textSubtle">
                --
              </Text>
            </Milestone>
            <Milestone>
              <Dot />
              <Text fontSize="12px" bold>
                {t('CLIFF')}
              </Text>
              <Text fontSize="12px" color="textSubtle">
                --
              </Text>
            </Milestone>
            <Milestone>
              <Dot />
              <Text fontSize="12px" bold>
                {t('VESTING END')}
              </Text>
              <Text fontSize="12px" color="textSubtle">
                --
              </Text>
            </Milestone>
          </Timeline>
          <FlexGap flexDirection="column" gap="8px">
            <FlexGap justifyContent="space-between">
              <Text color="textSubtle">{t('Release rate')}</Text>
              <Text>{t('1% per second')}</Text>
            </FlexGap>
            <FlexGap justifyContent="space-between">
              <Text color="textSubtle">{t('Vesting duration')}</Text>
              <Text>{t('30 days')}</Text>
            </FlexGap>
            <FlexGap justifyContent="space-between">
              <Text color="textSubtle">{t('Fully released date')}</Text>
              <Text>{t('Oct 29 2026 13:54:12')}</Text>
            </FlexGap>
          </FlexGap>
        </FlexGap>
      </CardBody>
    </Card>
  )
}

export default VestingScheduleCard
