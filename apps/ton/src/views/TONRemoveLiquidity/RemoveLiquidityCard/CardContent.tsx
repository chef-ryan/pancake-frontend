import { useTranslation } from '@pancakeswap/localization'
import { ArrowDownIcon, Box, BoxProps, Button, Flex, FlexGap, MinusIcon, Slider, Text } from '@pancakeswap/uikit'
import { tokenByAddressQueryAtom } from 'atoms/tokens/tokenByAddressQueryAtom'
import { SlippageButton } from 'components/Buttons/SlippageButton'
import { LightGreyCard } from 'components/Card'
import { WalletDisclaimer } from 'components/Card/WalletDisclaimer'
import { DisplayLoader } from 'components/Misc/DisplayLoader'
import { CurrencyLogo } from 'components/widgets'
import { NumberDisplay } from 'components/widgets/NumberDisplay'
import { PRESET_TOKENS } from 'config/constants/tokens'
import { usePoolRates } from 'hooks/liquidity/usePoolRates'
import { useAtomValue } from 'jotai'
import { useRouter } from 'next/router'
import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { addressAtom } from 'ton/atom/addressAtom'
import { lpBalanceQueryAtom } from 'ton/atom/liquidity/lpBalanceQueryAtom'
import { poolDataQueryAtom } from 'ton/atom/liquidity/poolDataQueryAtom'
import { networkAtom } from 'ton/atom/networkAtom'
import { useRemoveLiquidity } from 'ton/logic/liquidity/useRemoveLiquidity'
import { formatBalance } from 'ton/utils/formatting'

const Hr = styled.hr`
  width: 100%;
  border-color: ${({ theme }) => theme.colors.cardBorder};
`

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

  const userAddress = useAtomValue(addressAtom)
  const isWalletConnected = !!userAddress

  // Query params
  const router = useRouter()
  const network = useAtomValue(networkAtom)
  const [address0, address1] = router.query?.currency ?? ['TON', PRESET_TOKENS.CAKE[network].address]

  // TODO: Handle native
  const { data: currency0 } = useAtomValue(tokenByAddressQueryAtom(address0))
  const { data: currency1 } = useAtomValue(tokenByAddressQueryAtom(address1))

  const { data: lpBalance } = useAtomValue(
    lpBalanceQueryAtom({
      token0Address: currency0?.isNative ? userAddress : currency0?.address,
      token1Address: currency1?.isNative ? userAddress : currency1?.address,
    }),
  )
  const { data: poolData, isLoading: isPoolDataLoading } = useAtomValue(
    poolDataQueryAtom({
      token0Address: currency0?.isNative ? userAddress : currency0?.address,
      token1Address: currency1?.isNative ? userAddress : currency1?.address,
    }),
  )

  const [sliderValue, setSliderValue] = useState(10)

  const rates = usePoolRates({
    currency0,
    currency1,
    reserve0: poolData?.reserve0 ?? 0n,
    reserve1: poolData?.reserve1 ?? 0n,
  })

  const depositedAmounts = useMemo(() => {
    if (!lpBalance || !poolData) {
      return {
        amount0: 0n,
        amount1: 0n,
      }
    }

    return {
      amount0: (lpBalance * BigInt(poolData.reserve0)) / BigInt(poolData?.totalSupply ?? 1),
      amount1: (lpBalance * BigInt(poolData.reserve1)) / BigInt(poolData?.totalSupply ?? 1),
    }
  }, [lpBalance, poolData])

  const outputAmounts = useMemo(() => {
    // TODO: Calculate Fee amounts
    if (!depositedAmounts) {
      return {
        amount0: 0n,
        amount1: 0n,
      }
    }

    const amount0 = (BigInt(sliderValue) * BigInt(depositedAmounts.amount0)) / 100n
    const amount1 = (BigInt(sliderValue) * BigInt(depositedAmounts.amount1)) / 100n

    return {
      amount0,
      amount1,
    }
  }, [depositedAmounts, sliderValue])

  const { removeLiquidity } = useRemoveLiquidity({
    currency0,
    currency1,
  })

  const handleSliderChange = useCallback((value: number) => {
    setSliderValue(Math.round(value))
  }, [])

  const handleQuickInput = useCallback((value: number) => {
    setSliderValue(value)
  }, [])

  const handleRemoveLiquidity = useCallback(() => {
    removeLiquidity(lpBalance ? (lpBalance * BigInt(sliderValue)) / 100n : 0n)
  }, [removeLiquidity, lpBalance, sliderValue])

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
        <Text color="textSubtle">{t('You will receive')}</Text>
        <LightGreyCard mt="8px">
          <FlexGap flexDirection="column" gap="8px">
            <Flex justifyContent="space-between">
              <FlexGap gap="8px">
                <CurrencyLogo currency={currency0} />
                <Text color="textSubtle">{t('Pooled %currency%', { currency: currency0?.symbol ?? '' })}</Text>
              </FlexGap>

              <NumberDisplay value={formatBalance(outputAmounts?.amount0 ?? 0n, currency0?.decimals)} />
            </Flex>
            <Flex justifyContent="space-between">
              <FlexGap gap="8px">
                <CurrencyLogo currency={currency1} />
                <Text color="textSubtle">{t('Pooled %currency%', { currency: currency1?.symbol ?? '' })}</Text>
              </FlexGap>

              <NumberDisplay value={formatBalance(outputAmounts?.amount1 ?? 0n, currency1?.decimals)} />
            </Flex>
            <Hr />
            <Flex justifyContent="space-between">
              <FlexGap gap="8px">
                <CurrencyLogo currency={currency0} />
                <Text color="textSubtle">{t('%currency% fee earned', { currency: currency0?.symbol ?? '' })}</Text>
              </FlexGap>
              <Text>-</Text>
            </Flex>
            <Flex justifyContent="space-between">
              <FlexGap gap="8px">
                <CurrencyLogo currency={currency1} />
                <Text color="textSubtle">{t('%currency% fee earned', { currency: currency1?.symbol ?? '' })}</Text>
              </FlexGap>
              <Text>-</Text>
            </Flex>
          </FlexGap>
        </LightGreyCard>
        <FlexGap flexDirection="column" mt="24px" gap="16px">
          <Flex justifyContent="space-between">
            <Text color="textSubtle">{t('Rates')}</Text>
            <DisplayLoader loading={isPoolDataLoading}>
              {rates ? (
                <Box>
                  <Text>
                    1 {currency0?.symbol} ≈ {rates.currency0.toString()} {currency1?.symbol}
                  </Text>
                  <Text>
                    1 {currency1?.symbol} ≈ {rates.currency1.toString()} {currency0?.symbol}
                  </Text>
                </Box>
              ) : (
                <>
                  <Text>{t('Pool does not exist')}</Text>
                </>
              )}
            </DisplayLoader>
          </Flex>
          <Flex justifyContent="space-between" alignItems="center">
            <Text color="textSubtle">{t('Slippage Tolerance')}</Text>

            <SlippageButton />
          </Flex>
        </FlexGap>
      </ContentContainer>

      {isWalletConnected && (
        <StyledCardFooter>
          <Button onClick={handleRemoveLiquidity} width="100%" endIcon={<MinusIcon color="invertedContrast" />}>
            {t('Remove')}
          </Button>
        </StyledCardFooter>
      )}
    </>
  )
}
