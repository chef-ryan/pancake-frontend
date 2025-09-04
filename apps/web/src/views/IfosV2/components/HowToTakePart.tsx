import { useTranslation } from '@pancakeswap/localization'
import { Box, Card, CardBody, Flex, Heading, Text } from '@pancakeswap/uikit'
import { styled } from 'styled-components'
import useIfo from '../hooks/useIfo'

const SectionWrapper = styled(Box)`
  background: ${({ theme }) =>
    theme.isDark
      ? 'linear-gradient(112deg, #1a1a2e 0%, #16213e 100%)'
      : 'linear-gradient(112deg, #F2ECF2 0%, #E8F2F6 100%)'};
  padding: 48px 0;
`

const StyledHeading = styled(Heading)`
  color: ${({ theme }) => theme.colors.secondary};
  font-feature-settings: 'liga' off;
  font-family: Kanit;
  font-size: 40px;
  font-style: normal;
  font-weight: 600;
  line-height: 120%;
  letter-spacing: -0.4px;

  ${({ theme }) => theme.mediaQueries.xs} {
    font-size: 32px;
  }
`

const StyledCard = styled(Card)`
  background: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 24px;
  padding: 24px;
  width: 100%;
  max-width: 400px;
`

const StepNumber = styled(Box)`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;

  ${({ theme }) => theme.mediaQueries.md} {
    width: 64px;
    height: 64px;
  }
`

const StepCard = ({ stepNumber, title, description }: { stepNumber: number; title: string; description: string }) => {
  return (
    <StyledCard>
      <CardBody p="0">
        <StepNumber>
          <Text fontSize="24px" fontWeight="bold" color="white">
            {stepNumber}
          </Text>
        </StepNumber>
        <Heading as="h3" fontSize="24px" mb="16px" color="primary">
          {title}
        </Heading>
        <Text color="textSubtle" lineHeight="1.5">
          {description}
        </Text>
      </CardBody>
    </StyledCard>
  )
}

const HowToTakePart: React.FC = () => {
  const { t } = useTranslation()
  const { pools } = useIfo()

  const stakeSymbols = pools?.map((pool) => pool.stakeCurrency?.symbol).filter(Boolean) as string[]
  const commitTokensText =
    stakeSymbols.length === 1
      ? stakeSymbols[0]
      : stakeSymbols.length >= 2
      ? `${stakeSymbols[0]} or ${stakeSymbols[1]}`
      : 'CAKE'

  return (
    <SectionWrapper id="ifo-how-to">
      <Flex flexDirection="column" alignItems="center" mb="40px">
        <StyledHeading as="h2" textAlign="center">
          {t('How to Take Part')}
        </StyledHeading>
      </Flex>

      <Flex
        flexDirection={['column', 'column', 'row']}
        justifyContent="center"
        alignItems={['center', 'center', 'flex-start']}
        style={{ gap: '40px' }}
        px="16px"
      >
        <StepCard
          stepNumber={1}
          title={t('Commit %symbol%', { symbol: commitTokensText })}
          description={t(
            'When the IFO sales are live, you can "commit" your %symbol% to buy the tokens being sold.\n\nWe recommend committing to the Basic Sale first, but you can do both if you like.',
            { symbol: commitTokensText },
          )}
        />

        <StepCard
          stepNumber={2}
          title={t('Claim your tokens and achievement')}
          description={t(
            'After the IFO sales finish, you can claim any IFO tokens that you bought, and any unspent %symbol%-BNB LP tokens will be returned to your wallet.',
            { symbol: commitTokensText },
          )}
        />
      </Flex>
    </SectionWrapper>
  )
}

export default HowToTakePart
