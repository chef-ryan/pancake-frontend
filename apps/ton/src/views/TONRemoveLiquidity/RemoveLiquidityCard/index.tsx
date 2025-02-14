import { useTranslation } from '@pancakeswap/localization'
import { ArrowBackIcon, Box, BoxProps, Flex, FlexGap, Text } from '@pancakeswap/uikit'
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
export const RemoveLiquidityCard = (props: LiquidityCardProps) => {
  const { t } = useTranslation()

  return (
    <>
      <Card mb="64px" {...props}>
        <StyledCardHeader>
          <Flex justifyContent="space-between" alignItems="center">
            <Link href="/liquidity">
              <ArrowBackIcon color="primary60" />
            </Link>
            <FlexGap gap="2px">
              <Text fontSize={20} bold>
                {t('Remove Liquidity')}
              </Text>
            </FlexGap>
            <span />
          </Flex>
        </StyledCardHeader>

        <CardContent />
      </Card>
    </>
  )
}
