import { useTranslation } from '@pancakeswap/localization'
import { ArrowDownIcon, Box, BoxProps, Button, Flex, FlexGap, MinusIcon, Slider, Text } from '@pancakeswap/uikit'
import { useQuery } from '@tanstack/react-query'
import { setRemoveLiquidityModalAtom } from 'atoms/modals/removeLiquidityModalAtom'
import { tokenByAddressQueryAtom } from 'atoms/tokens/tokenByAddressQueryAtom'
import { SlippageButton } from 'components/Buttons/SlippageButton'
import { LightGreyCard } from 'components/Card'
import { WalletDisclaimer } from 'components/Card/WalletDisclaimer'
import { DisplayLoader } from 'components/Misc/DisplayLoader'
import { CurrencyLogo } from 'components/widgets'
import { NumberDisplay } from 'components/widgets/NumberDisplay'
import { MAXIMUM_SIGNIFICANT_DIGITS } from 'config/constants/exchange'
import { LP_TOKEN_DECIMALS } from 'config/constants/formatting'
import { usePoolRates } from 'hooks/liquidity/usePoolRates'
import { useAtomValue, useSetAtom } from 'jotai'
import { useRouter } from 'next/router'
import { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { addressAtom } from 'ton/atom/addressAtom'
import { lpBalanceQueryAtom } from 'ton/atom/liquidity/lpBalanceQueryAtom'
import { poolDataQueryAtom } from 'ton/atom/liquidity/poolDataQueryAtom'
import { useRemoveLiquidity } from 'ton/logic/liquidity/useRemoveLiquidity'
import { formatBalance } from 'ton/utils/formatting'
import { getCurrencyOrder } from 'ton/utils/tokenOrder'
import { logGTMClickRemoveLiquidityEvent } from 'utils/customGTMEventTracking'

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
  width: fit-content;
  height: 28px;
  border-radius: 8px;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primary60};
  font-size: 14px;

  ${({ theme }) => theme.mediaQueries.sm} {
    width: 100%;
  }
`

const QUICK_INPUTS = [10, 20, 75, 100]

interface CardContentProps extends BoxProps {}
export const CardContent = (props: CardContentProps) => {
  const { t } = useTranslation()

  const userAddress = useAtomValue(addressAtom)
  const isWalletConnected = !!userAddress

  const setRemoveLiquidityModal = useSetAtom(setRemoveLiquidityModalAtom)

  // Query params
  const router = useRouter()

  const [address0, address1] = useMemo(() => router.query?.currency ?? [], [router.query])

  // TODO: Handle native
  const { data: currency0_ } = useAtomValue(tokenByAddressQueryAtom(address0))
  const { data: currency1_ } = useAtomValue(tokenByAddressQueryAtom(address1))

  const {
    data: { currency0, currency1, isFlipped },
  } = useQuery({
    queryKey: ['removeLiquidity_currencyOrder', currency0_, currency1_],
    queryFn: async () => {
      return currency0_ && currency1_
        ? getCurrencyOrder(currency0_, currency1_)
        : {
            currency0: currency0_!,
            currency1: currency1_!,
            isFlipped: false,
          }
    },
    initialData: {
      currency0: currency0_!,
      currency1: currency1_!,
      isFlipped: false,
    },
  })

  console.log('RemoveLiquidity', {
    currency0: currency0?.symbol,
    currency1: currency1?.symbol,
    isFlipped,
  })

  const { data: lpBalance, isLoading: isLpBalanceLoading } = useAtomValue(
    lpBalanceQueryAtom({
      token0Address: currency0?.wrapped.address,
      token1Address: currency1?.wrapped.address,
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

  const lpTokensToBurn = useMemo(
    () => (lpBalance ? (lpBalance * BigInt(sliderValue)) / 100n : 0n),
    [lpBalance, sliderValue],
  )

  const { removeLiquidity } = useRemoveLiquidity({
    currency0,
    currency1,
    amount0ToBurn: formatBalance(outputAmounts?.amount0 ?? 0n, currency0?.decimals),
    amount1ToBurn: formatBalance(outputAmounts?.amount1 ?? 0n, currency1?.decimals),
  })

  const isDisabled = useMemo(() => {
    return (
      !lpBalance ||
      (!outputAmounts.amount0 && !outputAmounts.amount1) ||
      !currency0 ||
      !currency1 ||
      !rates.currency0 ||
      !rates.currency1 ||
      isLpBalanceLoading ||
      isPoolDataLoading
    )
  }, [lpBalance, outputAmounts, currency0, currency1, rates, isLpBalanceLoading, isPoolDataLoading])

  const handleSliderChange = useCallback((value: number) => {
    setSliderValue(Math.round(value))
  }, [])

  const handleQuickInput = useCallback((value: number) => {
    setSliderValue(value)
  }, [])

  const handleRemoveLiquidity = useCallback(() => {
    removeLiquidity(lpTokensToBurn)
  }, [removeLiquidity, lpTokensToBurn])

  const openConfirmationModal = useCallback(() => {
    logGTMClickRemoveLiquidityEvent()
    setRemoveLiquidityModal({
      amount0: formatBalance(outputAmounts?.amount0 ?? 0n, currency0?.decimals),
      amount1: formatBalance(outputAmounts?.amount1 ?? 0n, currency1?.decimals),
      currency0,
      currency1,
      tokenBurnAmount: formatBalance(lpTokensToBurn, LP_TOKEN_DECIMALS),
      onConfirm: handleRemoveLiquidity,
    })
  }, [
    setRemoveLiquidityModal,
    outputAmounts?.amount0,
    outputAmounts?.amount1,
    currency0,
    currency1,
    lpTokensToBurn,
    handleRemoveLiquidity,
  ])

  if (!isWalletConnected) {
    return (
      <ContentContainer $isBottomRounded={!isWalletConnected} {...props}>
        <WalletDisclaimer my="8px" text={t('Connect wallet to remove liquidity')} />
      </ContentContainer>
    )
  }

  return (
    <>
      <ContentContainer $isBottomRounded={!isWalletConnected} {...props}>
        <LightGreyCard>
          <Slider
            min={0}
            max={100}
            name="remove-liquidity-slider"
            valueLabel={t('%value%%', { value: sliderValue })}
            value={sliderValue}
            onValueChanged={handleSliderChange}
          />
          <FlexGap mt="12px" gap="16px" flexWrap={['wrap', 'nowrap']}>
            {QUICK_INPUTS.map((value) => (
              <StyledButton key={value} onClick={() => handleQuickInput(value)}>
                {value === 100 ? t('MAX') : t('%value%%', { value })}
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
            <Flex justifyContent="space-between" flexWrap="wrap">
              <FlexGap gap="8px">
                <CurrencyLogo currency={currency0} />
                <Text color="textSubtle">{t('Pooled %currency%', { currency: currency0?.symbol ?? '' })}</Text>
              </FlexGap>
              <DisplayLoader loading={isPoolDataLoading || isLpBalanceLoading}>
                <NumberDisplay value={formatBalance(outputAmounts?.amount0 ?? 0n, currency0?.decimals)} />
              </DisplayLoader>
            </Flex>
            <Flex justifyContent="space-between" flexWrap="wrap">
              <FlexGap gap="8px">
                <CurrencyLogo currency={currency1} />
                <Text color="textSubtle">{t('Pooled %currency%', { currency: currency1?.symbol ?? '' })}</Text>
              </FlexGap>
              <DisplayLoader loading={isPoolDataLoading || isLpBalanceLoading}>
                <NumberDisplay value={formatBalance(outputAmounts?.amount1 ?? 0n, currency1?.decimals)} />
              </DisplayLoader>
            </Flex>
          </FlexGap>
        </LightGreyCard>
        <FlexGap flexDirection="column" mt="24px" gap="16px">
          <Flex justifyContent="space-between" flexWrap="wrap">
            <Text color="textSubtle">{t('Rates')}</Text>
            <DisplayLoader loading={isPoolDataLoading}>
              {rates ? (
                <Box>
                  <Text>
                    1 {currency0?.symbol} ≈{' '}
                    <NumberDisplay
                      as="span"
                      value={rates.currency0.toString()}
                      maximumSignificantDigits={MAXIMUM_SIGNIFICANT_DIGITS}
                    />{' '}
                    {currency1?.symbol}
                  </Text>
                  <Text>
                    1 {currency1?.symbol} ≈{' '}
                    <NumberDisplay
                      as="span"
                      value={rates.currency1.toString()}
                      maximumSignificantDigits={MAXIMUM_SIGNIFICANT_DIGITS}
                    />{' '}
                    {currency0?.symbol}
                  </Text>
                </Box>
              ) : (
                <>
                  <Text>{t('Pool does not exist')}</Text>
                </>
              )}
            </DisplayLoader>
          </Flex>
          <Flex justifyContent="space-between" flexWrap="wrap" alignItems="center">
            <Text color="textSubtle">{t('Slippage Tolerance')}</Text>

            <SlippageButton />
          </Flex>
        </FlexGap>
      </ContentContainer>

      <StyledCardFooter>
        <Button
          onClick={openConfirmationModal}
          width="100%"
          endIcon={<MinusIcon color={isDisabled ? 'textDisabled' : 'invertedContrast'} />}
          disabled={isDisabled}
        >
          {t('Remove')}
        </Button>
      </StyledCardFooter>
    </>
  )
}
