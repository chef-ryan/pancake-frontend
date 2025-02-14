import { useTranslation } from '@pancakeswap/localization'
import { Currency } from '@pancakeswap/ton-v2-sdk'
import { AddIcon, Box, BoxProps, Button, Flex, FlexGap, Loading, Text, useToast } from '@pancakeswap/uikit'
import { setCurrencyAtom } from 'atoms/currencyAtoms'
import {
  currency0TypedValue,
  currency1TypedValue,
  liquidityIndependentFieldAtom,
} from 'atoms/liquidity/addLiquidityStateAtom'
import { setAddLiquidityModalAtom } from 'atoms/modals/addLiquidityModalAtom'
import { BigNumber as BN } from 'bignumber.js'
import { ConnectWalletButton } from 'components/Buttons/ConnectWalletButton'
import { SlippageButton } from 'components/Buttons/SlippageButton'
import { DisplayLoader } from 'components/Misc/DisplayLoader'
import CurrencyInputPanelSimplify from 'components/TonSwap/CurrencyInputPanelSimplify'
import { NumberDisplay } from 'components/widgets/NumberDisplay'
import { usePoolRates } from 'hooks/liquidity/usePoolRates'
import { useCurrency } from 'hooks/tokens/useCurrency'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo } from 'react'
import styled from 'styled-components'
import { addressAtom } from 'ton/atom/addressAtom'
import { lpBalanceQueryAtom } from 'ton/atom/liquidity/lpBalanceQueryAtom'
import { poolDataQueryAtom } from 'ton/atom/liquidity/poolDataQueryAtom'
import { useAddLiquidity } from 'ton/logic/liquidity/useAddLiquidity'
import { parseUnits } from 'ton/utils/formatting'
import { getExpectedPoolTokens } from 'ton/utils/pool'
import { CurrencyField } from 'types/currency'
import { currencyKey } from 'utils/tokens/currency'

const ContentContainer = styled(Box)<{ $isBottomRounded?: boolean }>`
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme, $isBottomRounded }) =>
    $isBottomRounded ? `0 0 ${theme.radii.card} ${theme.radii.card}` : '0'};
`

const StyledCardFooter = styled(Box)`
  padding: 24px;

  border-top: 1px solid ${({ theme }) => theme.colors.cardBorder};
`

interface CardContentProps extends BoxProps {}
export const CardContent = (props: CardContentProps) => {
  const { t } = useTranslation()

  // Query params
  const router = useRouter()
  const [token0Address, token1Address] = router.query?.currency ?? []

  const address = useAtomValue(addressAtom)
  const isWalletConnected = !!address

  const [currency0] = useCurrency(CurrencyField.ADD_LIQUIDITY_CURRENCY0, token0Address)
  const [currency1] = useCurrency(CurrencyField.ADD_LIQUIDITY_CURRENCY1, token1Address)

  const [independentField, setIndependentField] = useAtom(liquidityIndependentFieldAtom)

  const setCurrency = useSetAtom(setCurrencyAtom)
  const setAddLiquidityModal = useSetAtom(setAddLiquidityModalAtom)

  const { data: poolData, isLoading: isPoolDataLoading } = useAtomValue(
    poolDataQueryAtom({ token0Address: currency0?.wrapped.address, token1Address: currency1?.wrapped.address }),
  )

  // TODO: Handle native token
  const { data: lpBalance, isLoading: isLpBalanceLoading } = useAtomValue(
    lpBalanceQueryAtom({
      token0Address: currency0?.isNative ? address : currency0?.address,
      token1Address: currency1?.isNative ? address : currency1?.address,
    }),
  )

  const shareInPool = useMemo(() => {
    if (!lpBalance || !poolData?.totalSupply) return 0n

    return BN(lpBalance.toString()).div(BN(poolData.totalSupply.toString())).times(100).toNumber()
  }, [lpBalance, poolData?.totalSupply])

  const rates = usePoolRates({
    currency0,
    currency1,
    reserve0: poolData?.reserve0,
    reserve1: poolData?.reserve1,
  })

  const [token0Value, setToken0Value] = useAtom(currency0TypedValue)
  const [token1Value, setToken1Value] = useAtom(currency1TypedValue)

  const { addLiquidity } = useAddLiquidity()

  const { toastSuccess, toastError } = useToast()

  const isDisabled = useMemo(
    () => !currency0 || !currency1 || !token0Value || !token1Value,
    [currency0, currency1, token0Value, token1Value],
  )

  const updateQueryParams = useCallback(() => {
    router.replace(
      {
        query: {
          currency: [currencyKey(currency0), currencyKey(currency1)],
        },
      },
      undefined,
      { shallow: true },
    )
  }, [router, currency0, currency1])

  // TODO: Replace useEffect
  useEffect(() => {
    if (currency0 || currency1) updateQueryParams()
  }, [currency0, currency1, updateQueryParams])

  // const calculateOutputAmount = useCallback(() => {
  //   if (rates.currency0 && rates.currency1 && currency0 && currency1) {
  //     const amount0 = BN(token0Value)
  //     const amount1 = BN(token1Value)

  //     if (independentField === CurrencyField.ADD_LIQUIDITY_CURRENCY0) {
  //       if (amount0.isZero()) setToken1Value('0')
  //       setToken1Value(amount0.times(rates.currency0).toString())
  //     } else if (independentField === CurrencyField.ADD_LIQUIDITY_CURRENCY1) {
  //       if (amount1.isZero()) setToken0Value('0')
  //       setToken0Value(amount1.times(rates.currency1).toString())
  //     }
  //   }
  // }, [
  //   rates.currency0,
  //   rates.currency1,
  //   currency0,
  //   currency1,
  //   token0Value,
  //   token1Value,
  //   independentField,
  //   setToken0Value,
  //   setToken1Value,
  // ])

  const handleToken0Input = useCallback(
    (value: string) => {
      setToken0Value(value)
      setIndependentField(CurrencyField.ADD_LIQUIDITY_CURRENCY0)

      // calculateOutputAmount()
    },
    [setToken0Value, setIndependentField],
  )

  const handleToken1Input = useCallback(
    (value: string) => {
      setToken1Value(value)
      setIndependentField(CurrencyField.ADD_LIQUIDITY_CURRENCY1)

      // calculateOutputAmount()
    },
    [setToken1Value, setIndependentField],
  )

  const onCurrencySelection = useCallback(
    (field: CurrencyField, currency: Currency) => {
      // Check if currency is same as in the other field
      if (field === CurrencyField.ADD_LIQUIDITY_CURRENCY0 && currency.equals(currency1)) {
        setCurrency(CurrencyField.ADD_LIQUIDITY_CURRENCY1, currency0)
      } else if (field === CurrencyField.ADD_LIQUIDITY_CURRENCY1 && currency.equals(currency0)) {
        setCurrency(CurrencyField.ADD_LIQUIDITY_CURRENCY0, currency1)
      }

      setCurrency(field, currency)
    },
    [setCurrency, currency0, currency1],
  )

  const handleAddLiquidity = useCallback(async () => {
    if (isDisabled || !currency0?.wrapped.address || !currency1?.wrapped.address) return

    try {
      // TODO: Handle native currencies
      addLiquidity({
        token0: currency0,
        token1: currency1,

        amount0: parseUnits(token0Value, currency0.decimals),
        amount1: parseUnits(token1Value, currency1.decimals),
      })

      toastSuccess(t('Liquidity added'))
    } catch (e) {
      console.error('Error adding liquidity', e)
      toastError(t('Error adding liquidity'))
    }
  }, [t, addLiquidity, toastSuccess, toastError, currency0, currency1, isDisabled, token0Value, token1Value])

  const openConfirmationModal = useCallback(() => {
    // TODO: Determine data directly in modal
    setAddLiquidityModal({
      isOpen: true,
      currency0,
      currency1,
      outputAmount: getExpectedPoolTokens({
        amount0: token0Value,
        amount1: token1Value,
        reserve0: poolData?.reserve0 || 0n,
        reserve1: poolData?.reserve1 || 0n,
        totalSupply: poolData?.totalSupply || 0n,
      }).toString(),
      amount0: token0Value,
      amount1: token1Value,
      rate0: rates.currency0.toString(),
      rate1: rates.currency1.toString(),
      shareInPool: shareInPool.toString(),
      onConfirm: handleAddLiquidity,
    })
  }, [
    currency0,
    currency1,
    token0Value,
    token1Value,
    rates,
    shareInPool,
    poolData?.reserve0,
    poolData?.reserve1,
    poolData?.totalSupply,
    setAddLiquidityModal,
    handleAddLiquidity,
  ])

  return (
    <>
      <ContentContainer $isBottomRounded={!isWalletConnected} {...props}>
        <CurrencyInputPanelSimplify
          id="add-liquidity-panel-token0"
          onUserInput={handleToken0Input}
          value={token0Value}
          currency={currency0}
          onCurrencySelect={(newCurrency) => onCurrencySelection(CurrencyField.ADD_LIQUIDITY_CURRENCY0, newCurrency)}
          showMaxButton={false}
          title={
            <Text color="textSubtle" small>
              {t('Choose a valid trading pair')}
            </Text>
          }
        />

        <AddIcon mt="12px" width={28} />

        <Box mt="-18px">
          <CurrencyInputPanelSimplify
            id="add-liquidity-panel-token1"
            onUserInput={handleToken1Input}
            value={token1Value}
            currency={currency1}
            onCurrencySelect={(newCurrency) => onCurrencySelection(CurrencyField.ADD_LIQUIDITY_CURRENCY1, newCurrency)}
            showMaxButton={false}
            showQuickInputButton={false}
          />
        </Box>

        <FlexGap flexDirection="column" mt="24px" gap="16px">
          <Flex justifyContent="space-between">
            <Text color="textSubtle">{t('Rates')}</Text>
            {poolData ? (
              <Box>
                <Text>
                  1 {currency0?.symbol} ≈ {rates.currency0.toString()} {currency1?.symbol}
                </Text>
                <Text>
                  1 {currency1?.symbol} ≈ {rates.currency1.toString()} {currency0?.symbol}
                </Text>
              </Box>
            ) : isPoolDataLoading ? (
              <>
                <Loading />
              </>
            ) : (
              <>
                <Text>{t('Pool does not exist')}</Text>
              </>
            )}
          </Flex>
          <Flex justifyContent="space-between">
            <Text color="textSubtle">{t('Your share in the pair')}</Text>

            <DisplayLoader loading={isLpBalanceLoading}>
              <NumberDisplay value={shareInPool.toString()} suffix="%" maximumSignificantDigits={6} />
            </DisplayLoader>
          </Flex>
          <Flex justifyContent="space-between" alignItems="center">
            <Text color="textSubtle">{t('Slippage Tolerance')}</Text>

            <SlippageButton />
          </Flex>
        </FlexGap>
      </ContentContainer>

      <StyledCardFooter>
        {!isWalletConnected ? (
          <ConnectWalletButton width="100%" />
        ) : (
          <Button onClick={openConfirmationModal} width="100%" disabled={isDisabled}>
            {t('Supply')}
          </Button>
        )}
      </StyledCardFooter>
    </>
  )
}
