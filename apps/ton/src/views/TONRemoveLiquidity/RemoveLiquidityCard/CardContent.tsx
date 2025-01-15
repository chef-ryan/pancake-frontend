import { useTranslation } from '@pancakeswap/localization'
import { ArrowDownIcon, Box, BoxProps, Button, Flex, FlexGap, MinusIcon, Slider, Text } from '@pancakeswap/uikit'
import { LightGreyCard } from 'components/Card'
import { WalletDisclaimer } from 'components/Card/WalletDisclaimer'
import { useRouter } from 'next/router'
import { useCallback, useState } from 'react'
import styled from 'styled-components'

const ContentContainer = styled(Box)<{ $isBottomRounded?: boolean }>`
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.invertedContrast};
  border-radius: ${({ theme, $isBottomRounded }) =>
    $isBottomRounded ? `0 0 ${theme.radii.card} ${theme.radii.card}` : '0'};
`

const StyledCardFooter = styled(Box)`
  padding: 24px;

  border-top: 1px solid ${({ theme }) => theme.colors.cardBorder};
`

const StyledButton = styled(Button).attrs({
  scale: 'sm',
  variant: 'tertiary',
})`
  width: 100%;
  height: 28px;
  border-radius: 8px;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primary60};
  font-size: 14px;
`

const QUICK_INPUTS = [10, 20, 75, 100]

interface CardContentProps extends BoxProps {}
export const CardContent = (props: CardContentProps) => {
  const { t } = useTranslation()
  const isWalletConnected = true

  // Query params
  const router = useRouter()
  const [currency0, currency1] = router.query?.currency ?? ['TON', 'USDT']

  const [sliderValue, setSliderValue] = useState(0)

  const handleSliderChange = useCallback((value: number) => {
    setSliderValue(Math.round(value))
  }, [])

  const handleQuickInput = useCallback((value: number) => {
    setSliderValue(value)
  }, [])

  return (
    <>
      <ContentContainer $isBottomRounded={!isWalletConnected} {...props}>
        {!isWalletConnected && <WalletDisclaimer my="8px" text={t('Connect wallet to add liquidity')} />}
        <LightGreyCard>
          <Slider
            min={0}
            max={100}
            name="remove-liquidity-slider"
            valueLabel={`${sliderValue}%`}
            value={sliderValue}
            onValueChanged={handleSliderChange}
          />
          <FlexGap mt="12px" gap="16px">
            {QUICK_INPUTS.map((value) => (
              <StyledButton key={value} onClick={() => handleQuickInput(value)}>
                {value === 100 ? 'MAX' : `${value}%`}
              </StyledButton>
            ))}
          </FlexGap>
        </LightGreyCard>

        <FlexGap alignItems="center" justifyContent="center" mt="12px">
          <ArrowDownIcon mt="12px" color="textSubtle" width={28} />
        </FlexGap>

        <Text color="textSubtle">You will receive</Text>
        <LightGreyCard mt="8px">
          <FlexGap flexDirection="column" gap="8px">
            <Flex justifyContent="space-between">
              <Text color="textSubtle">Pooled {currency0}</Text>
              <Text>5</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text color="textSubtle">Pooled {currency1}</Text>
              <Text>10</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text color="textSubtle">{currency0} fee earned</Text>
              <Text>0.1</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <Text color="textSubtle">{currency1} fee earned</Text>
              <Text>0.2</Text>
            </Flex>
          </FlexGap>
        </LightGreyCard>
      </ContentContainer>

      {isWalletConnected && (
        <StyledCardFooter>
          <Button width="100%" endIcon={<MinusIcon color="white" />}>
            Remove
          </Button>
        </StyledCardFooter>
      )}
    </>
  )
}
