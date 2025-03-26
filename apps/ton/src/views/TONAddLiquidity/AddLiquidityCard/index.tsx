import { useTranslation } from '@pancakeswap/localization'
import { ArrowBackIcon, Box, BoxProps, Flex, FlexGap, QuestionHelper, Text } from '@pancakeswap/uikit'
import Link from 'next/link'
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
export const AddLiquidityCard = (props: LiquidityCardProps) => {
  const { t } = useTranslation()

  return (
    <>
      <Card {...props}>
        <StyledCardHeader>
          <Flex justifyContent="space-between" alignItems="center">
            <Link href="/liquidity">
              <ArrowBackIcon color="primary60" />
            </Link>
            <FlexGap gap="2px">
              <Text fontSize={20} bold>
                {t('Add Liquidity')}
              </Text>
              <QuestionHelper
                text={t(
                  "When you add liquidity, you'll receive pool tokens that represent your position. These tokens earn fees automatically, proportional to your share of the pool.",
                )}
                placement="bottom-start"
              />
            </FlexGap>
            <span />
          </Flex>
        </StyledCardHeader>

        <CardContent />
      </Card>
    </>
  )
}
