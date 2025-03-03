import { useTranslation } from '@pancakeswap/localization'
import { Box, BoxProps, FlexGap, QuestionHelper, Text } from '@pancakeswap/uikit'
import styled from 'styled-components'
import { CardContent } from './CardContent'

const Card = styled(Box)`
  border-radius: ${({ theme }) => theme.radii.card};
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
`

const StyledCardHeader = styled(Box)`
  padding: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.cardBorder};
`

interface LiquidityCardProps extends BoxProps {}
export const LiquidityCard = (props: LiquidityCardProps) => {
  const { t } = useTranslation()

  return (
    <>
      <Card {...props}>
        <StyledCardHeader>
          <Text fontSize={20} bold>
            {t('Your Liquidity')}
          </Text>
          <Text color="textSubtle">
            <FlexGap gap="2px">
              <span>{t('Receive LP tokens and earn trading fees')}</span>
              <QuestionHelper
                text={t(`
                    When you add liquidity, you'll receive pool tokens that represent your position. These tokens earn fees automatically, proportional to your share of the pool.
                `)}
                placement="bottom-start"
              />
            </FlexGap>
          </Text>
        </StyledCardHeader>
        <CardContent />
      </Card>
    </>
  )
}
