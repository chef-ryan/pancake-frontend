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
import { MAXIMUM_SIGNIFICANT_DIGITS } from 'config/constants/exchange'
import { LP_TOKEN_DECIMALS } from 'config/constants/formatting'
import { usePoolRates } from 'hooks/liquidity/usePoolRates'
import { useCurrency } from 'hooks/tokens/useCurrency'
import { useCurrencyOrder } from 'hooks/tokens/useCurrencyOrder'
import { useUserSlippage } from 'hooks/useUserSlippage'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { addressAtom } from 'ton/atom/addressAtom'
import { lpBalanceQueryAtom } from 'ton/atom/liquidity/lpBalanceQueryAtom'
import { poolDataQueryAtom } from 'ton/atom/liquidity/poolDataQueryAtom'
import { balanceAtom } from 'ton/logic/balanceAtom'
import { useAddLiquidity } from 'ton/logic/liquidity/useAddLiquidity'
import { formatBalance, parseUnits } from 'ton/utils/formatting'
import { getExpectedPoolTokens, getNewPoolShare } from 'ton/utils/pool'
import { CurrencyField } from 'types/currency'
import { logGTMClickAddLiquidityConfirmEvent, logGTMClickAddLiquidityEvent } from 'utils/customGTMEventTracking'
import { currencyKey } from 'utils/tokens/currency'
import { RefundAlert } from './RefundAlert'

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

  const { addLiquidity } = useAddLiquidity()
  const { toastSuccess, toastError } = useToast()

  // Query params
  const router = useRouter()
  const [token0Address, token1Address] = router.query?.currency ?? []

  const address = useAtomValue(addressAtom)
  const isWalletConnected = !!address

  const [slippage] = useUserSlippage()

  const currency0 = useCurrency(token0Address)
  const currency1 = useCurrency(token1Address)

  const { isFlipped } = useCurrencyOrder({
    currency0_: currency0,
    currency1_: currency1,
  })

  const [token0Value, setToken0Value] = useAtom(currency0TypedValue)
  const [token1Value, setToken1Value] = useAtom(currency1TypedValue)

  const [independentField, setIndependentField] = useAtom(liquidityIndependentFieldAtom)

  const { data: balance0 } = useAtomValue(balanceAtom(currency0))
  const { data: balance1 } = useAtomValue(balanceAtom(currency1))

  const setCurrency = useSetAtom(setCurrencyAtom)
  const setAddLiquidityModal = useSetAtom(setAddLiquidityModalAtom)

  const { data: poolDataUnordered, isLoading: isPoolDataLoading } = useAtomValue(
    poolDataQueryAtom({ token0Address: currency0?.wrapped.address, token1Address: currency1?.wrapped.address }),
  )

  // Correct poolData for the currently selected order of currencies
  const poolData = useMemo(() => {
    if (!poolDataUnordered) return undefined
    return {
      ...poolDataUnordered,
      reserve0: isFlipped ? poolDataUnordered.reserve1 : poolDataUnordered.reserve0,
      reserve1: isFlipped ? poolDataUnordered.reserve0 : poolDataUnordered.reserve1,
    }
  }, [poolDataUnordered, isFlipped])

  const { data: lpBalance, isLoading: isLpBalanceLoading } = useAtomValue(
    lpBalanceQueryAtom({
      token0Address: currency0?.wrapped.address,
      token1Address: currency1?.wrapped.address,
    }),
  )

  const rates = usePoolRates({
    currency0,
    currency1,
    reserve0: poolData?.reserve0,
    reserve1: poolData?.reserve1,
  })

  const isPoolExists = useMemo(() => Boolean(poolData && poolData?.totalSupply), [poolData])

  const currencyAmounts = useMemo(() => {
    return {
      [CurrencyField.ADD_LIQUIDITY_CURRENCY0]:
        independentField === CurrencyField.ADD_LIQUIDITY_CURRENCY0 || !rates.currency1 || !rates.currency0
          ? token0Value
          : BN(token1Value).isFinite()
          ? BN(token1Value)
              .times(rates.currency1)
              .toFixed(currency0?.decimals ?? 0, BN.ROUND_DOWN)
          : '',
      [CurrencyField.ADD_LIQUIDITY_CURRENCY1]:
        independentField === CurrencyField.ADD_LIQUIDITY_CURRENCY1 || !rates.currency0 || !rates.currency1
          ? token1Value
          : BN(token0Value).isFinite()
          ? BN(token0Value)
              .times(rates.currency0)
              .toFixed(currency1?.decimals ?? 0, BN.ROUND_DOWN)
          : '',
    }
  }, [independentField, token0Value, token1Value, rates.currency0, rates.currency1, currency0, currency1])

  const isInsufficientBalance0 = useMemo(() => {
    if (!currency0) return false
    return BN(currencyAmounts[CurrencyField.ADD_LIQUIDITY_CURRENCY0]).gt(
      BN(formatBalance(balance0, currency0.decimals)),
    )
  }, [currencyAmounts, balance0, currency0])

  const isInsufficientBalance1 = useMemo(() => {
    if (!currency1) return false
    return BN(currencyAmounts[CurrencyField.ADD_LIQUIDITY_CURRENCY1]).gt(
      BN(formatBalance(balance1, currency1.decimals)),
    )
  }, [currencyAmounts, balance1, currency1])

  const isDisabled = useMemo(() => {
    return (
      !currency0 ||
      !currency1 ||
      !currencyAmounts[CurrencyField.ADD_LIQUIDITY_CURRENCY0] ||
      !currencyAmounts[CurrencyField.ADD_LIQUIDITY_CURRENCY1] ||
      BN(currencyAmounts[CurrencyField.ADD_LIQUIDITY_CURRENCY0]).isZero() ||
      BN(currencyAmounts[CurrencyField.ADD_LIQUIDITY_CURRENCY1]).isZero() ||
      isInsufficientBalance0 ||
      isInsufficientBalance1 ||
      isPoolDataLoading
    )
  }, [currency0, currency1, currencyAmounts, isInsufficientBalance0, isInsufficientBalance1, isPoolDataLoading])

  const expectedPoolTokens = useMemo(() => {
    if (!currency0 || !currency1) return BN(0)

    const amount0 = currencyAmounts[CurrencyField.ADD_LIQUIDITY_CURRENCY0]
    const amount1 = currencyAmounts[CurrencyField.ADD_LIQUIDITY_CURRENCY1]

    const parsedAmount0 = parseUnits(amount0, currency0.decimals)
    const parsedAmount1 = parseUnits(amount1, currency1.decimals)

    const parsedReserve0 = poolData?.reserve0 || 0n
    const parsedReserve1 = poolData?.reserve1 || 0n
    const parsedTotalSupply = poolData?.totalSupply || 0n

    return getExpectedPoolTokens({
      amount0: parsedAmount0,
      amount1: parsedAmount1,
      reserve0: parsedReserve0,
      reserve1: parsedReserve1,
      totalSupply: parsedTotalSupply,
    }).dividedBy(10 ** LP_TOKEN_DECIMALS)
  }, [currency0, currency1, currencyAmounts, poolData?.totalSupply, poolData?.reserve0, poolData?.reserve1])

  const expectedShareInPool = useMemo(() => {
    const parsedExpectedPoolTokens = expectedPoolTokens.isFinite()
      ? parseUnits(expectedPoolTokens.toFixed(LP_TOKEN_DECIMALS) || 0n, LP_TOKEN_DECIMALS).toString()
      : '0'

    // If new pool being created
    if (!poolData?.totalSupply) {
      if (
        currencyAmounts[CurrencyField.ADD_LIQUIDITY_CURRENCY0] &&
        currencyAmounts[CurrencyField.ADD_LIQUIDITY_CURRENCY1]
      ) {
        return getNewPoolShare(parsedExpectedPoolTokens).toString()
      }

      return '0'
    }

    const expectedTotalSupply = poolData?.totalSupply
      ? BN(poolData.totalSupply.toString()).plus(parsedExpectedPoolTokens)
      : BN(parsedExpectedPoolTokens)

    // Expected Share = ((Current LP Tokens + Expected LP Tokens) / Total Supply) * 100
    return BN(lpBalance ? lpBalance?.toString() : 0)
      .plus(BN(parsedExpectedPoolTokens))
      .div(expectedTotalSupply)
      .times(100)
      .toString()
  }, [lpBalance, poolData?.totalSupply, expectedPoolTokens, currencyAmounts])

  const expectedRates = useMemo(() => {
    if (!currency0 || !currency1) return { expectedRate0: '0', expectedRate1: '0' }

    const amount0 = currencyAmounts[CurrencyField.ADD_LIQUIDITY_CURRENCY0]
    const amount1 = currencyAmounts[CurrencyField.ADD_LIQUIDITY_CURRENCY1]

    const formattedReserve0 = formatBalance(poolData?.reserve0 || 0n, currency0.decimals)
    const formattedReserve1 = formatBalance(poolData?.reserve1 || 0n, currency1.decimals)

    const expectedReserve0 = BN(formattedReserve0).plus(amount0)
    const expectedReserve1 = BN(formattedReserve1).plus(amount1)

    const expectedRate0 = expectedReserve1.div(expectedReserve0).toString()
    const expectedRate1 = expectedReserve0.div(expectedReserve1).toString()

    return {
      expectedRate0,
      expectedRate1,
    }
  }, [currencyAmounts, poolData?.reserve0, poolData?.reserve1, currency0, currency1])

  const handleToken0Input = useCallback(
    (value: string) => {
      setToken0Value(value)
      setIndependentField(CurrencyField.ADD_LIQUIDITY_CURRENCY0)
    },
    [setToken0Value, setIndependentField],
  )

  const handleToken1Input = useCallback(
    (value: string) => {
      setToken1Value(value)
      setIndependentField(CurrencyField.ADD_LIQUIDITY_CURRENCY1)
    },
    [setToken1Value, setIndependentField],
  )

  const onCurrencySelection = useCallback(
    (field: CurrencyField, currency: Currency) => {
      let currentCurrency0 = currency0
      let currentCurrency1 = currency1

      // Check if currency is same as in the other field
      if (field === CurrencyField.ADD_LIQUIDITY_CURRENCY0 && currency.equals(currency1)) {
        setCurrency(CurrencyField.ADD_LIQUIDITY_CURRENCY1, currency0)
        currentCurrency1 = currency0
      } else if (field === CurrencyField.ADD_LIQUIDITY_CURRENCY1 && currency.equals(currency0)) {
        setCurrency(CurrencyField.ADD_LIQUIDITY_CURRENCY0, currency1)
        currentCurrency0 = currency1
      }

      setCurrency(field, currency)

      // Update query parameters
      const newCurrency0 = field === CurrencyField.ADD_LIQUIDITY_CURRENCY0 ? currency : currentCurrency0
      const newCurrency1 = field === CurrencyField.ADD_LIQUIDITY_CURRENCY1 ? currency : currentCurrency1
      router.replace(
        {
          query: {
            ...router.query,
            currency: [currencyKey(newCurrency0), currencyKey(newCurrency1)],
          },
        },
        undefined,
        { shallow: true },
      )
    },
    [setCurrency, currency0, currency1, router],
  )

  const handleAddLiquidity = useCallback(async () => {
    if (isDisabled || !currency0?.wrapped.address || !currency1?.wrapped.address) return
    logGTMClickAddLiquidityConfirmEvent()
    try {
      const parsedAmount0 = parseUnits(currencyAmounts[CurrencyField.ADD_LIQUIDITY_CURRENCY0], currency0.decimals)
      const parsedAmount1 = parseUnits(currencyAmounts[CurrencyField.ADD_LIQUIDITY_CURRENCY1], currency1.decimals)

      const minLpOut = parseUnits(
        expectedPoolTokens.multipliedBy(1 - slippage / 10_000).toFixed(LP_TOKEN_DECIMALS, BN.ROUND_DOWN),
        LP_TOKEN_DECIMALS,
      )

      console.log('minLpOut', {
        minLpOut,
        slippageAdjustedLPExpected: expectedPoolTokens
          .multipliedBy(1 - slippage / 10_000)
          .toFixed(LP_TOKEN_DECIMALS, BN.ROUND_DOWN),
        amount0: currencyAmounts[CurrencyField.ADD_LIQUIDITY_CURRENCY0],
        amount1: currencyAmounts[CurrencyField.ADD_LIQUIDITY_CURRENCY1],
        parsedAmount0: parseUnits(currencyAmounts[CurrencyField.ADD_LIQUIDITY_CURRENCY0], currency0.decimals),
        parsedAmount1: parseUnits(currencyAmounts[CurrencyField.ADD_LIQUIDITY_CURRENCY1], currency1.decimals),
      })

      // Add liquidity
      addLiquidity({
        token0: currency0,
        token1: currency1,
        amount0: parsedAmount0,
        amount1: parsedAmount1,
        minLpOut: BigInt(minLpOut),
      })

      toastSuccess(t('Liquidity added'))
    } catch (e) {
      console.error('Error adding liquidity', e)
      toastError(t('Error adding liquidity'))
    }
  }, [
    t,
    addLiquidity,
    toastSuccess,
    toastError,
    currency0,
    currency1,
    isDisabled,
    currencyAmounts,
    slippage,
    expectedPoolTokens,
  ])

  const openConfirmationModal = useCallback(() => {
    logGTMClickAddLiquidityEvent()
    setAddLiquidityModal({
      isOpen: true,
      currency0,
      currency1,
      outputAmount: expectedPoolTokens.toFixed(LP_TOKEN_DECIMALS, BN.ROUND_DOWN),
      amount0: currencyAmounts[CurrencyField.ADD_LIQUIDITY_CURRENCY0],
      amount1: currencyAmounts[CurrencyField.ADD_LIQUIDITY_CURRENCY1],
      rate0: expectedRates.expectedRate0,
      rate1: expectedRates.expectedRate1,
      shareInPool: expectedShareInPool,
      onConfirm: handleAddLiquidity,
    })
  }, [
    currency0,
    currency1,
    currencyAmounts,
    expectedShareInPool,
    expectedPoolTokens,
    expectedRates,
    setAddLiquidityModal,
    handleAddLiquidity,
  ])

  return (
    <>
      <ContentContainer $isBottomRounded={!isWalletConnected} {...props}>
        <CurrencyInputPanelSimplify
          id="add-liquidity-panel-token0"
          onUserInput={handleToken0Input}
          value={currencyAmounts[CurrencyField.ADD_LIQUIDITY_CURRENCY0]}
          currency={currency0}
          onCurrencySelect={(newCurrency) => onCurrencySelection(CurrencyField.ADD_LIQUIDITY_CURRENCY0, newCurrency)}
          showMaxButton={false}
          title={
            <Text color="textSubtle" small>
              {t('Choose a trading pair')}
            </Text>
          }
          disabled={isPoolDataLoading}
        />

        <AddIcon mt="12px" color="textSubtle" width={28} />

        <Box mt="-18px">
          <CurrencyInputPanelSimplify
            id="add-liquidity-panel-token1"
            onUserInput={handleToken1Input}
            value={currencyAmounts[CurrencyField.ADD_LIQUIDITY_CURRENCY1]}
            currency={currency1}
            onCurrencySelect={(newCurrency) => onCurrencySelection(CurrencyField.ADD_LIQUIDITY_CURRENCY1, newCurrency)}
            showMaxButton={false}
            showQuickInputButton={false}
            disabled={isPoolDataLoading}
            title={<>&nbsp;</>}
          />
        </Box>

        <FlexGap flexDirection="column" mt="24px" gap="16px">
          <Flex justifyContent="space-between" flexWrap="wrap">
            <Text color="textSubtle">{t('Rates')}</Text>
            {isPoolExists ? (
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
          <Flex justifyContent="space-between" flexWrap="wrap">
            <Text color="textSubtle">{t('Your share in the pair')}</Text>

            <DisplayLoader loading={isPoolDataLoading || (isPoolExists && isLpBalanceLoading)}>
              {expectedShareInPool ? (
                <NumberDisplay value={expectedShareInPool.toString()} suffix="%" maximumSignificantDigits={6} />
              ) : (
                '-'
              )}
            </DisplayLoader>
          </Flex>
          <Flex justifyContent="space-between" flexWrap="wrap" alignItems="center">
            <Text color="textSubtle">{t('Slippage Tolerance')}</Text>

            <SlippageButton />
          </Flex>

          <RefundAlert
            currency0={currency0}
            currency1={currency1}
            poolAddress={poolData?.poolAddress.toString() || ''}
          />
        </FlexGap>
      </ContentContainer>

      <StyledCardFooter>
        {!isWalletConnected ? (
          <ConnectWalletButton width="100%" />
        ) : (
          <Button onClick={openConfirmationModal} width="100%" disabled={isDisabled}>
            {isPoolDataLoading ? (
              <>
                {t('Updating')} <Loading ml="8px" size="14px" />{' '}
              </>
            ) : isInsufficientBalance0 || isInsufficientBalance1 ? (
              t('Insufficient %tokens% Balance', {
                tokens:
                  isInsufficientBalance0 && !isInsufficientBalance1
                    ? currency0?.symbol
                    : !isInsufficientBalance0 && isInsufficientBalance1
                    ? currency1?.symbol
                    : `${currency0?.symbol} & ${currency1?.symbol}`,
              })
            ) : (
              t('Supply')
            )}
          </Button>
        )}
      </StyledCardFooter>
    </>
  )
}
