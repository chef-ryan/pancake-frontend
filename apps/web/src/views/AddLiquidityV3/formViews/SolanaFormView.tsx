import BN from 'bn.js'
import { Protocol } from '@pancakeswap/farms'
import { useTranslation } from '@pancakeswap/localization'
import { Currency, CurrencyAmount, Percent, isSolWSol, isUnifedCurrencySorted } from '@pancakeswap/sdk'
import { useStablecoinPrice } from 'hooks/useStablecoinPrice'
import { Price } from '@pancakeswap/swap-sdk-core'
import {
  AutoColumn,
  Box,
  Button,
  Card,
  CardBody,
  Column,
  DynamicSection,
  FlexGap,
  InfoIcon,
  Message,
  MessageText,
  PreTitle,
  RowBetween,
  SwapHorizIcon,
  Text,
  Toggle,
  useMatchBreakpoints,
  useModal,
  useTooltip,
} from '@pancakeswap/uikit'
import { useIsExpertMode, useUserSlippage } from '@pancakeswap/utils/user'
import { FeeAmount } from '@pancakeswap/v3-sdk'
import {
  ConfirmationModalContent,
  Liquidity,
  NumericalInput,
  PricePeriodRangeChart,
  ZOOM_LEVELS,
  ZoomLevels,
} from '@pancakeswap/widgets-internal'
import BigNumber from 'bignumber.js'
import CurrencyInputPanelSimplify from 'components/CurrencyInputPanelSimplify'
import TransactionConfirmationModal from 'components/TransactionConfirmationModal'
import { LightGreyCard } from 'components/Card'
import Divider from 'components/Divider'
import { DoubleCurrencyLogo } from 'components/Logo'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { RangePriceSection } from 'components/RangePriceSection'
import { RangeTag } from 'components/RangeTag'
import { Bound } from 'config/constants/types'
import { useIsTransactionUnsupported, useIsTransactionWarning } from 'hooks/Trades'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { ApprovalState } from 'hooks/useApproveCallback'
import { useUnifiedNativeCurrency } from 'hooks/useNativeCurrency'
import { usePoolMarketPriceSlippage } from 'hooks/usePoolMarketPriceSlippage'
import { tryParsePrice } from 'hooks/v3/utils'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { styled } from 'styled-components'
import { logGTMClickAddLiquidityConfirmEvent, logGTMClickAddLiquidityEvent } from 'utils/customGTMEventTracking'
import { formatPrice, formatCurrencyAmount } from 'utils/formatCurrencyAmount'
import { maxAmountSpend } from 'utils/maxAmountSpend'
import { CurrencyField as Field } from 'utils/types'
import { useTokenRateData } from 'views/AddLiquidityInfinity/components/useTokenToTokenRateData'
import { getAxisTicks } from 'views/AddLiquidityInfinity/utils'
import { V3SubmitButton } from 'views/AddLiquidityV3/components/V3SubmitButton'
import { useSolanaDensityChartData } from 'views/AddLiquidityV3/hooks/useSolanaDensityChartData'
import {
  useCurrencyInversionEvent,
  useHeaderInvertCurrencies,
} from 'views/AddLiquidityV3/hooks/useHeaderInvertCurrencies'
import { useNativeCurrencyInstead } from 'views/AddLiquidityV3/hooks/useNativeCurrencyInstead'
import { HandleFeePoolSelectFn, QUICK_ACTION_CONFIGS } from 'views/AddLiquidityV3/types'
import { MarketPriceSlippageWarning } from 'views/CreateLiquidityPool/components/SubmitCreateButton'
import { Dot } from 'views/Notifications/styles'
import { LiquiditySlippageButton } from 'views/Swap/components/SlippageButton'
import { formatDollarAmount } from 'views/V3Info/utils/numbers'
import { useSolanaDerivedInfo } from 'hooks/solana/useSolanaDerivedInfo'
import { useSolanaPoolByMint } from 'hooks/solana/useSolanaPoolsByMint'
import { useRaydiumClient } from 'hooks/solana/useRaydiumClient'
import { FieldFeeLevel } from 'views/CreateLiquidityPool/components/FieldFeeLevel'
import { formatTickPrice } from 'hooks/v3/utils/formatTickPrice'
import { multiplyPriceByAmount } from 'utils/prices'
import { useSolanaOnchainClmmPool } from 'hooks/solana/useSolanaOnchainPool'
import { TxVersion } from '@pancakeswap/solana-core-sdk'

import { useTotalUsdValue } from '../../AddLiquidity/hooks/useTotalUsdValue'
import LockedDeposit from './V3FormView/components/LockedDeposit'
import V3RangeSelector from './V3FormView/components/V3RangeSelector'
import { useInitialRange } from './V3FormView/form/hooks/useInitialRange'
import { useRangeHopCallbacks } from './V3FormView/form/hooks/useRangeHopCallbacks'
import { useV3MintActionHandlers } from './V3FormView/form/hooks/useV3MintActionHandlers'
import { useV3FormAddLiquidityCallback, useV3FormState } from './V3FormView/form/reducer'

const StyledInput = styled(NumericalInput)`
  background-color: ${({ theme }) => theme.colors.input};
  box-shadow: ${({ theme, error }) => theme.shadows[error ? 'warning' : 'inset']};
  border-radius: 16px;
  padding: 8px 16px;
  font-size: 16px;
  width: 100%;
  margin-bottom: 16px;
`

export const LeftContainer = styled(AutoColumn)`
  height: fit-content;

  grid-column: 1;
`

const CurrentPriceButton = styled(Button).attrs({ scale: 'xs', variant: 'text' })`
  height: 24px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 600;
  border-radius: 8px;

  display: flex;
  align-items: center;
  gap: 4px;

  background: transparent;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primary60};
`

interface SolanaFormViewPropsType {
  baseCurrency?: Currency | null
  quoteCurrency?: Currency | null
  currencyIdA?: string
  currencyIdB?: string
  feeAmount?: number
}

const approveCb = () => Promise.resolve(undefined)

export function SolanaFormView({
  feeAmount,
  baseCurrency,
  quoteCurrency,
  currencyIdA,
  currencyIdB,
}: SolanaFormViewPropsType) {
  const router = useRouter()
  const { isMobile } = useMatchBreakpoints()
  const native = useUnifiedNativeCurrency()

  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm
  const [txnErrorMessage, setTxnErrorMessage] = useState<string | undefined>()

  const {
    t,
    currentLanguage: { locale },
  } = useTranslation()
  const expertMode = useIsExpertMode()

  const { canUseNativeCurrency, handleUseNative, useNativeInstead } = useNativeCurrencyInstead({
    baseCurrency,
    quoteCurrency,
    feeAmount,
  })

  // Negate the effect of useNativeCurrencyInstead when we need actual WNATIVE currency
  const baseCurrencyWithoutNative = useMemo(() => {
    return baseCurrency?.isNative ? (baseCurrency.wrapped as Currency) : baseCurrency
  }, [baseCurrency])
  const quoteCurrencyWithoutNative = useMemo(() => {
    return quoteCurrency?.isNative ? (quoteCurrency.wrapped as Currency) : quoteCurrency
  }, [quoteCurrency])

  // Price Rate Data
  const solPoolInfo = useSolanaPoolByMint(
    baseCurrencyWithoutNative?.wrapped?.address,
    quoteCurrencyWithoutNative?.wrapped?.address,
    feeAmount,
  )
  const { data: poolOnChain } = useSolanaOnchainClmmPool(solPoolInfo?.poolId)

  const { solanaAccount: account, isWrongNetwork } = useAccountActiveChain()

  const [pricePeriod, setPricePeriod] = useState<Liquidity.PresetRangeItem>(Liquidity.PRESET_RANGE_ITEMS[0])
  const axisTicks = useMemo(() => getAxisTicks(pricePeriod.value, isMobile), [pricePeriod.value, isMobile])

  // mint state
  const formState = useV3FormState()
  const { independentField, typedValue, startPriceTypedValue, leftRangeTypedValue, rightRangeTypedValue } = formState

  const {
    pool,
    ticks,
    dependentField,
    price,
    pricesAtTicks,
    parsedAmounts,
    currencyBalances,
    noLiquidity,
    currencies,
    errorMessage,
    hasInsufficentBalance,
    invalidPool,
    invalidRange,
    outOfRange,
    depositADisabled,
    depositBDisabled,
    invertPrice,
    ticksAtLimit,
    tickSpaceLimits,
  } = useSolanaDerivedInfo(
    baseCurrency ?? undefined,
    quoteCurrency ?? undefined,
    feeAmount,
    baseCurrency ?? undefined,
    undefined,
    formState,
  )
  const { onFieldAInput, onFieldBInput, onLeftRangeInput, onRightRangeInput, onStartPriceInput, onBothRangeInput } =
    useV3MintActionHandlers(noLiquidity)

  const onBothRangePriceInput = useCallback(
    (leftRangeValue: string, rightRangeValue: string) => {
      onBothRangeInput({
        leftTypedValue: tryParsePrice(baseCurrency?.wrapped, quoteCurrency?.wrapped, leftRangeValue),
        rightTypedValue: tryParsePrice(baseCurrency?.wrapped, quoteCurrency?.wrapped, rightRangeValue),
      })
    },
    [baseCurrency, quoteCurrency, onBothRangeInput],
  )

  const onLeftRangePriceInput = useCallback(
    (leftRangeValue: string) => {
      onLeftRangeInput(tryParsePrice(baseCurrency?.wrapped, quoteCurrency?.wrapped, leftRangeValue))
    },
    [baseCurrency, quoteCurrency, onLeftRangeInput],
  )

  const onRightRangePriceInput = useCallback(
    (rightRangeValue: string) => {
      onRightRangeInput(tryParsePrice(baseCurrency?.wrapped, quoteCurrency?.wrapped, rightRangeValue))
    },
    [baseCurrency, quoteCurrency, onRightRangeInput],
  )

  const isValid = !errorMessage && !invalidRange

  // modal and loading
  // capital efficiency warning
  const [showCapitalEfficiencyWarning, setShowCapitalEfficiencyWarning] = useState<boolean>(false)

  useEffect(() => {
    setShowCapitalEfficiencyWarning(false)
  }, [baseCurrency, quoteCurrency, feeAmount])

  useEffect(() => {
    if (feeAmount) {
      setActiveQuickAction(undefined)
      onBothRangeInput({
        leftTypedValue: undefined,
        rightTypedValue: undefined,
      })
    }
    // NOTE: ignore exhaustive-deps to avoid infinite re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feeAmount])

  const onAddLiquidityCallback = useV3FormAddLiquidityCallback()

  // Current token prices
  const baseCurrencyCurrentPrice = useStablecoinPrice(baseCurrency)
  const quoteCurrencyCurrentPrice = useStablecoinPrice(quoteCurrency)
  const currentPrice = useMemo(() => {
    if (
      !baseCurrencyCurrentPrice ||
      !quoteCurrencyCurrentPrice ||
      !baseCurrency ||
      !quoteCurrency ||
      quoteCurrencyCurrentPrice.numerator === 0n
    )
      return undefined
    return baseCurrencyCurrentPrice.divide(quoteCurrencyCurrentPrice)
  }, [baseCurrency, quoteCurrency, baseCurrencyCurrentPrice, quoteCurrencyCurrentPrice])

  const [txHash, setTxHash] = useState<string>('')

  // get formatted amounts
  const formattedAmounts = useMemo(
    () => ({
      [independentField]: typedValue,
      [dependentField]: parsedAmounts[dependentField]?.toSignificant(6) ?? '',
    }),
    [dependentField, independentField, parsedAmounts, typedValue],
  )

  // Get Total USD Value of input amounts
  const { totalUsdValue } = useTotalUsdValue({
    parsedAmountA: parsedAmounts[Field.CURRENCY_A],
    parsedAmountB: parsedAmounts[Field.CURRENCY_B],
  })

  // Get the max amounts user can add
  const maxAmounts: { [field in Field]?: CurrencyAmount<Currency> } = useMemo(
    () =>
      [Field.CURRENCY_A, Field.CURRENCY_B].reduce((accumulator, field) => {
        return {
          ...accumulator,
          [field]: maxAmountSpend(currencyBalances[field]),
        }
      }, {}),
    [currencyBalances],
  )

  const [allowedSlippage] = useUserSlippage() // custom from users

  const handleFeePoolSelect = useCallback<HandleFeePoolSelectFn>(
    ({ feeAmount: newFeeAmount }) => {
      // Avoid replacing stable and v2 due to navigation issues when using universal farms overlay
      if (!newFeeAmount || router.pathname.includes('stable') || router.pathname.includes('v2')) {
        return
      }
      router.replace(
        {
          query: {
            ...router.query,
            currency: newFeeAmount
              ? [currencyIdA!, currencyIdB!, newFeeAmount.toString()]
              : [currencyIdA!, currencyIdB!],
          },
        },
        undefined,
        { shallow: true },
      )
    },
    [currencyIdA, currencyIdB, router],
  )

  const raydium = useRaydiumClient()

  const onAdd = useCallback(async () => {
    logGTMClickAddLiquidityConfirmEvent()
    try {
      if (!baseCurrency || !quoteCurrency) return
      if (!raydium) return
      const poolInfo = solPoolInfo?.solanaData as any
      if (!poolInfo || !ticks?.[Bound.LOWER] || !ticks?.[Bound.UPPER]) return

      setAttemptingTxn(true)

      // Map parsed amounts to pool mintA/mintB order
      const currencyA = currencies[Field.CURRENCY_A]
      const mintAAddr = solPoolInfo?.token0?.address
      const aIsMintA = currencyA?.wrapped?.address === mintAAddr
      const amountAQuot = parsedAmounts[Field.CURRENCY_A]?.quotient
      const amountBQuot = parsedAmounts[Field.CURRENCY_B]?.quotient
      const mintAAmount = new BN((aIsMintA ? amountAQuot : amountBQuot)?.toString() ?? '0')
      const mintBAmount = new BN((aIsMintA ? amountBQuot : amountAQuot)?.toString() ?? '0')

      if (mintAAmount.isZero() && mintBAmount.isZero()) {
        setTxnErrorMessage(t('Enter an amount'))
        return
      }
      const baseIsMintA = mintAAmount.gte(mintBAmount)
      const base: 'MintA' | 'MintB' = baseIsMintA ? 'MintA' : 'MintB'
      const baseAmount = baseIsMintA ? mintAAmount : mintBAmount
      const otherAmountMax = baseIsMintA ? mintBAmount : mintAAmount

      const build = await raydium.clmm.openPositionFromBase({
        poolInfo,
        ownerInfo: {
          useSOLBalance: isSolWSol(poolInfo.mintA) || isSolWSol(poolInfo.mintB),
        },
        tickLower: ticks[Bound.LOWER] as number,
        tickUpper: ticks[Bound.UPPER] as number,
        base,
        baseAmount,
        otherAmountMax,
        txVersion: TxVersion.V0,
        nft2022: true,
      })

      const { txId } = await build.execute()
      setAttemptingTxn(false)
      setTxHash(txId)
      onAddLiquidityCallback(txId)
    } catch (e: any) {
      setAttemptingTxn(false)
      setTxnErrorMessage(e?.message ?? 'Failed to add liquidity')
    }
  }, [baseCurrency, quoteCurrency, currencies, parsedAmounts, ticks, solPoolInfo, onAddLiquidityCallback, raydium, t])

  const handleDismissConfirmation = useCallback(() => {
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onFieldAInput('')
    }
    setTxHash('')
    setTxnErrorMessage(undefined)
  }, [onFieldAInput, txHash])
  const addIsUnsupported = useIsTransactionUnsupported(currencies?.CURRENCY_A, currencies?.CURRENCY_B)

  // get value and prices at ticks
  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks
  const { [Bound.LOWER]: priceLower, [Bound.UPPER]: priceUpper } = pricesAtTicks

  useInitialRange(baseCurrency?.wrapped, quoteCurrency?.wrapped)

  const { getDecrementLower, getIncrementLower, getDecrementUpper, getIncrementUpper, getSetFullRange } =
    useRangeHopCallbacks(baseCurrency ?? undefined, quoteCurrency ?? undefined, feeAmount, tickLower, tickUpper, pool)
  // we need an existence check on parsed amounts for single-asset deposits
  const translationData = useMemo(() => {
    if (depositADisabled) {
      return {
        amount: formatCurrencyAmount(parsedAmounts[Field.CURRENCY_B], 4, locale),
        symbol: currencies[Field.CURRENCY_B]?.symbol ? currencies[Field.CURRENCY_B].symbol : '',
      }
    }
    if (depositBDisabled) {
      return {
        amount: formatCurrencyAmount(parsedAmounts[Field.CURRENCY_A], 4, locale),
        symbol: currencies[Field.CURRENCY_A]?.symbol ? currencies[Field.CURRENCY_A].symbol : '',
      }
    }
    return {
      amountA: formatCurrencyAmount(parsedAmounts[Field.CURRENCY_A], 4, locale),
      symbolA: currencies[Field.CURRENCY_A]?.symbol ? currencies[Field.CURRENCY_A].symbol : '',
      amountB: formatCurrencyAmount(parsedAmounts[Field.CURRENCY_B], 4, locale),
      symbolB: currencies[Field.CURRENCY_B]?.symbol ? currencies[Field.CURRENCY_B].symbol : '',
    }
  }, [depositADisabled, depositBDisabled, parsedAmounts, locale, currencies])

  const pendingText = useMemo(
    () =>
      !outOfRange
        ? t('Supplying %amountA% %symbolA% and %amountB% %symbolB%', translationData)
        : t('Supplying %amount% %symbol%', translationData),
    [t, outOfRange, translationData],
  )

  const [activeQuickAction, setActiveQuickAction] = useState<number>()
  const isQuickButtonUsed = useRef(false)
  const [quickAction, setQuickAction] = useState<number | null>(null)
  const [customZoomLevel, setCustomZoomLevel] = useState<ZoomLevels | undefined>(undefined)

  const [onPresentAddLiquidityModal] = useModal(
    <TransactionConfirmationModal
      minWidth={['100%', null, '420px']}
      title={t('Add Liquidity')}
      customOnDismiss={handleDismissConfirmation}
      attemptingTxn={attemptingTxn}
      hash={txHash}
      errorMessage={txnErrorMessage}
      content={() => {
        const currencyA = currencies[Field.CURRENCY_A]
        const currencyB = currencies[Field.CURRENCY_B]

        return (
          <ConfirmationModalContent
            topContent={() => (
              <AutoColumn gap="md" style={{ marginTop: '0.5rem' }}>
                <RowBetween style={{ marginBottom: '0.5rem' }}>
                  <FlexGap gap="8px" alignItems="center">
                    <DoubleCurrencyLogo currency0={currencyA} currency1={currencyB} size={24} />
                    <Text bold>
                      {currencyA?.symbol}-{currencyB?.symbol}
                    </Text>
                  </FlexGap>
                  <RangeTag removed={false} outOfRange={Boolean(outOfRange)} />
                </RowBetween>

                <LightGreyCard>
                  <AutoColumn gap="sm">
                    <RowBetween>
                      <FlexGap gap="4px" alignItems="center">
                        <CurrencyLogo currency={currencyA} />
                        <Text>{currencyA?.symbol}</Text>
                      </FlexGap>
                      <Box>
                        <Text>{parsedAmounts[Field.CURRENCY_A]?.toSignificant(6) || '-'}</Text>
                        <Text fontSize="10px" color="textSubtle" textAlign="right">
                          ~
                          {formatDollarAmount(
                            multiplyPriceByAmount(
                              baseCurrencyCurrentPrice,
                              parseFloat(parsedAmounts[Field.CURRENCY_A]?.toExact() || '0'),
                            ),
                          )}
                        </Text>
                      </Box>
                    </RowBetween>
                    <RowBetween>
                      <FlexGap gap="4px" alignItems="center">
                        <CurrencyLogo currency={currencyB} />
                        <Text>{currencyB?.symbol}</Text>
                      </FlexGap>
                      <Box>
                        <Text>{parsedAmounts[Field.CURRENCY_B]?.toSignificant(6) || '-'}</Text>
                        <Text fontSize="10px" color="textSubtle" textAlign="right">
                          ~
                          {formatDollarAmount(
                            multiplyPriceByAmount(
                              quoteCurrencyCurrentPrice,
                              parseFloat(parsedAmounts[Field.CURRENCY_B]?.toExact() || '0'),
                            ),
                          )}
                        </Text>
                      </Box>
                    </RowBetween>
                    <Divider />
                    <RowBetween>
                      <Text color="textSubtle">{t('Fee Tier')}</Text>
                      <Text>{((feeAmount ?? (pool as any)?.fee ?? 0) / 10000).toString()}%</Text>
                    </RowBetween>
                  </AutoColumn>
                </LightGreyCard>

                <AutoColumn gap="md">
                  <RowBetween>
                    <div />
                  </RowBetween>

                  <RowBetween>
                    <RangePriceSection
                      width="48%"
                      title={t('Min Price')}
                      currency0={isSorted ? quoteCurrency : baseCurrency}
                      currency1={isSorted ? baseCurrency : quoteCurrency}
                      price={formatTickPrice(minPrice, ticksAtLimit, Bound.LOWER, locale)}
                    />
                    <RangePriceSection
                      width="48%"
                      title={t('Max Price')}
                      currency0={isSorted ? quoteCurrency : baseCurrency}
                      currency1={isSorted ? baseCurrency : quoteCurrency}
                      price={formatTickPrice(maxPrice, ticksAtLimit, Bound.UPPER, locale)}
                    />
                  </RowBetween>
                  <RangePriceSection
                    title={t('Current Price')}
                    currency0={isSorted ? quoteCurrency : baseCurrency}
                    currency1={isSorted ? baseCurrency : quoteCurrency}
                    price={formatPrice(displayedPrice, 6, locale)}
                  />
                </AutoColumn>

                <LightGreyCard>
                  <RowBetween>
                    <Text color="textSubtle">{t('Total Deposit')}</Text>
                    <Text>~{formatDollarAmount(totalUsdValue, 2, false)}</Text>
                  </RowBetween>
                </LightGreyCard>
              </AutoColumn>
            )}
            bottomContent={() => (
              <Button width="100%" mt="16px" onClick={onAdd}>
                {t('Add')}
              </Button>
            )}
          />
        )
      }}
      pendingText={pendingText}
    />,
    true,
    true,
    'TransactionConfirmationModal',
  )

  const addIsWarning = useIsTransactionWarning(currencies?.CURRENCY_A, currencies?.CURRENCY_B)

  const handleButtonSubmit = useCallback(() => {
    // eslint-disable-next-line no-unused-expressions
    expertMode ? onAdd() : onPresentAddLiquidityModal()
    logGTMClickAddLiquidityEvent()
  }, [expertMode, onAdd, onPresentAddLiquidityModal])

  const poolCurrentPrice = useMemo(() => {
    if (!pool) return undefined
    return new Price(pool.token0, pool.token1, 2n ** 192n, pool.sqrtRatioX96 * pool.sqrtRatioX96)
  }, [pool])
  const [marketPrice, marketPriceSlippage] = usePoolMarketPriceSlippage(pool?.token0, pool?.token1, poolCurrentPrice)
  const displayMarketPriceSlippageWarning = useMemo(() => {
    if (marketPriceSlippage === undefined) return false
    const slippage = new BigNumber(marketPriceSlippage.toFixed(0)).abs()
    return slippage.gt(5) // 5% slippage
  }, [marketPriceSlippage])

  const buttons = (
    <V3SubmitButton
      addIsUnsupported={addIsUnsupported}
      addIsWarning={addIsWarning}
      account={account ?? undefined}
      isWrongNetwork={Boolean(isWrongNetwork)}
      approvalA={ApprovalState.APPROVED}
      approvalB={ApprovalState.APPROVED}
      isValid={isValid}
      showApprovalA={false}
      approveACallback={approveCb}
      revokeACallback={approveCb}
      currencies={currencies}
      showApprovalB={false}
      approveBCallback={approveCb}
      revokeBCallback={approveCb}
      parsedAmounts={parsedAmounts}
      onClick={handleButtonSubmit}
      attemptingTxn={attemptingTxn}
      errorMessage={errorMessage}
      buttonText={t('Add')}
      depositADisabled={depositADisabled}
      depositBDisabled={depositBDisabled}
    />
  )

  // Sorted orientation vs token0/token1 for display purposes
  const isSorted = useMemo(
    () => (baseCurrency && quoteCurrency ? isUnifedCurrencySorted(baseCurrency, quoteCurrency) : false),
    [baseCurrency, quoteCurrency],
  )
  const displayedPrice = useMemo(() => (isSorted ? price : price?.invert()), [isSorted, price])
  const minPrice = useMemo(
    () => (isSorted ? pricesAtTicks[Bound.LOWER] : pricesAtTicks[Bound.UPPER]?.invert()),
    [isSorted, pricesAtTicks],
  )
  const maxPrice = useMemo(
    () => (isSorted ? pricesAtTicks[Bound.UPPER] : pricesAtTicks[Bound.LOWER]?.invert()),
    [isSorted, pricesAtTicks],
  )

  useEffect(() => {
    if (!isQuickButtonUsed.current && activeQuickAction) {
      setActiveQuickAction(undefined)
      setQuickAction(null)
      setCustomZoomLevel(undefined)
    } else if (isQuickButtonUsed.current) {
      isQuickButtonUsed.current = false
    }
  }, [isQuickButtonUsed, activeQuickAction, leftRangeTypedValue, rightRangeTypedValue])

  const handleRefresh = useCallback(
    (zoomLevel?: ZoomLevels) => {
      setActiveQuickAction(undefined)
      if (!zoomLevel) {
        setCustomZoomLevel(undefined)
      }
      const currentPrice = price ? parseFloat((invertPrice ? price.invert() : price).toSignificant(8)) : undefined
      if (currentPrice) {
        onBothRangeInput({
          leftTypedValue: tryParsePrice(
            baseCurrency?.wrapped,
            quoteCurrency?.wrapped,
            (
              currentPrice * (zoomLevel?.initialMin ?? ZOOM_LEVELS[feeAmount ?? FeeAmount.MEDIUM].initialMin)
            ).toString(),
          ),
          rightTypedValue: tryParsePrice(
            baseCurrency?.wrapped,
            quoteCurrency?.wrapped,
            (
              currentPrice * (zoomLevel?.initialMax ?? ZOOM_LEVELS[feeAmount ?? FeeAmount.MEDIUM].initialMax)
            ).toString(),
          ),
        })
      }
    },
    [price, feeAmount, invertPrice, onBothRangeInput, baseCurrency, quoteCurrency],
  )

  const handleQuickAction = useCallback(
    (value: number | null, zoomLevel: ZoomLevels) => {
      setQuickAction(value)
      if (value !== null) {
        // Check if it's a full range action (100)
        if (value === 100) {
          setCustomZoomLevel(undefined)
          setShowCapitalEfficiencyWarning(true)
          setActiveQuickAction(100)
          isQuickButtonUsed.current = true
        } else {
          const isPredefinedAction = feeAmount && QUICK_ACTION_CONFIGS[feeAmount]?.[value]

          if (isPredefinedAction) {
            setCustomZoomLevel(undefined)
            // if (value === activeQuickAction) {
            //   handleRefresh(ZOOM_LEVELS[feeAmount])
            // } else

            handleRefresh(QUICK_ACTION_CONFIGS[feeAmount][value])
            setActiveQuickAction(value)
            isQuickButtonUsed.current = true
          } else {
            setCustomZoomLevel(zoomLevel)
            handleRefresh(zoomLevel)
            setActiveQuickAction(value)
            isQuickButtonUsed.current = true
          }
        }
      }
    },
    [activeQuickAction, feeAmount, handleRefresh, setShowCapitalEfficiencyWarning],
  )

  const invertRange = useCallback(() => {
    if (!ticksAtLimit[Bound.LOWER] && !ticksAtLimit[Bound.UPPER]) {
      onLeftRangeInput((invertPrice ? priceLower : priceUpper?.invert()) ?? undefined)
      onRightRangeInput((invertPrice ? priceUpper : priceLower?.invert()) ?? undefined)
      onFieldAInput(formattedAmounts[Field.CURRENCY_B] ?? '')
    }
  }, [
    ticksAtLimit,
    onLeftRangeInput,
    onRightRangeInput,
    onFieldAInput,
    invertPrice,
    priceLower,
    priceUpper,
    formattedAmounts,
  ])

  // Currency Inversion
  const inversionEvent = useCurrencyInversionEvent()

  const { handleInvertCurrencies } = useHeaderInvertCurrencies({
    currencyIdA,
    currencyIdB,
    feeAmount,
  })

  useEffect(() => {
    if (inversionEvent) {
      const { currencyIdA: newCurrencyIdA, currencyIdB: newCurrencyIdB } = inversionEvent
      if (newCurrencyIdA && newCurrencyIdB && newCurrencyIdA !== currencyIdA && newCurrencyIdB !== currencyIdB) {
        invertRange()
      }
    }
  }, [inversionEvent])

  const handleInvertStartPriceCurrencies = useCallback(() => {
    handleInvertCurrencies()
    onStartPriceInput(price?.invert()?.toSignificant(18) ?? '')
  }, [price, onStartPriceInput, handleInvertCurrencies])

  const {
    isLoading: isChartDataLoading,
    error: chartDataError,
    formattedData,
  } = useSolanaDensityChartData({
    currencyA: baseCurrency ?? undefined,
    currencyB: quoteCurrency ?? undefined,
    feeAmount,
  })

  const chartCurrentPrice = useMemo(() => {
    return price ? parseFloat((invertPrice ? price.invert() : price).toSignificant(8)) : undefined
  }, [price, invertPrice])

  const { data: rateData } = useTokenRateData({
    period: pricePeriod.value,
    baseCurrency: baseCurrencyWithoutNative ?? undefined,
    quoteCurrency: quoteCurrencyWithoutNative ?? undefined,
    chainId: baseCurrency?.chainId,
    protocol: Protocol.V3,
    poolId: solPoolInfo?.poolId,
  })

  const handleUseCurrentPrice = useCallback(() => {
    onStartPriceInput(currentPrice?.toSignificant(18) ?? '')
  }, [currentPrice, onStartPriceInput])

  const {
    tooltip: currentPriceTooltip,
    tooltipVisible: currentPriceTooltipVisible,
    targetRef: currentPriceTargetRef,
  } = useTooltip(t('The price is an estimation of the current market price. Please verify before using it.'), {
    placement: 'bottom',
    avoidToStopPropagation: true,
  })

  return (
    <>
      <LeftContainer>
        <Card>
          <CardBody>
            <AutoColumn gap="16px">
              {noLiquidity && (
                <Box>
                  <FlexGap gap="8px" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                    <PreTitle mb="8px">{t('Set Starting Price')}</PreTitle>

                    {currentPrice ? (
                      <FlexGap mb="8px" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                        <div />
                        <FlexGap gap="4px" alignItems="center" flexWrap="wrap">
                          <div ref={currentPriceTargetRef}>
                            <CurrentPriceButton onClick={handleUseCurrentPrice}>
                              <span>{t('Use Market Price')}</span>
                              <InfoIcon color="primary60" width="18px" />
                            </CurrentPriceButton>
                            {currentPriceTooltipVisible && currentPriceTooltip}
                          </div>
                          <Text color="textSubtle" small>
                            {currentPrice.toSignificant(8)} {quoteCurrency?.symbol} per {baseCurrency?.symbol}
                          </Text>
                          <SwapHorizIcon
                            role="button"
                            color="primary60"
                            onClick={handleInvertStartPriceCurrencies}
                            style={{ cursor: 'pointer' }}
                          />
                        </FlexGap>
                      </FlexGap>
                    ) : (
                      <Liquidity.RateToggle
                        currencyA={baseCurrency}
                        handleRateToggle={handleInvertStartPriceCurrencies}
                      />
                    )}
                  </FlexGap>
                  <Message variant="warning" my="8px">
                    <MessageText>
                      {t(
                        'This pool must be initialized before you can add liquidity. To initialize, select a starting price for the pool. Then, enter your liquidity price range and deposit amount. Gas fees will be higher than usual due to the initialization transaction.',
                      )}
                      <br />
                      <br />

                      <span style={{ fontWeight: 600 }}>
                        {t('Fee-on transfer tokens and rebasing tokens are NOT compatible with V3.')}
                      </span>
                    </MessageText>
                  </Message>
                  <FlexGap gap="8px" alignItems="baseline" justifyContent="space-between">
                    <StyledInput
                      className="start-price-input"
                      value={startPriceTypedValue}
                      onUserInput={onStartPriceInput}
                    />
                    <Text color="textSubtle">{quoteCurrency?.symbol}</Text>
                  </FlexGap>
                </Box>
              )}
              <DynamicSection disabled={!feeAmount || invalidPool}>
                <FlexGap gap="8px" justifyContent="space-between" alignItems="center" flexWrap="wrap">
                  <PreTitle>{t('Set position range')}</PreTitle>
                  {!noLiquidity && (
                    <FlexGap gap="8px" alignItems="center" flexWrap="wrap">
                      <FlexGap gap="8px" alignItems="center">
                        <Dot color="primary" show />
                        <Text color="textSubtle" small>
                          {t('Current Price')}
                        </Text>
                      </FlexGap>
                      <FlexGap gap="8px" alignItems="center">
                        <Dot color="secondary" show />
                        <Text color="textSubtle" small>
                          {t('Position Range')}
                        </Text>
                      </FlexGap>
                      <FlexGap gap="8px" alignItems="center">
                        <Dot color="input" show />
                        <Text color="textSubtle" small>
                          {t('Liquidity Depth')}
                        </Text>
                      </FlexGap>
                    </FlexGap>
                  )}
                </FlexGap>

                {!noLiquidity && (
                  <>
                    <Box mt="22px" border="1px solid" borderColor="cardBorder" borderRadius="24px" p="8px">
                      <FlexGap
                        flexDirection={isMobile ? 'column' : 'row'}
                        justifyContent={isMobile ? 'flex-start' : 'space-between'}
                        gap="16px"
                        mb="24px"
                      >
                        <Liquidity.PriceRangeDatePicker onChange={setPricePeriod} value={pricePeriod} />
                      </FlexGap>

                      <PricePeriodRangeChart
                        isLoading={isChartDataLoading}
                        key={baseCurrency?.wrapped.address}
                        zoomLevel={
                          customZoomLevel ||
                          (activeQuickAction && feeAmount
                            ? QUICK_ACTION_CONFIGS?.[feeAmount]?.[activeQuickAction]
                            : undefined)
                        }
                        baseCurrency={baseCurrencyWithoutNative}
                        quoteCurrency={quoteCurrencyWithoutNative}
                        ticksAtLimit={ticksAtLimit}
                        price={chartCurrentPrice}
                        priceLower={priceLower}
                        priceUpper={priceUpper}
                        onBothRangeInput={onBothRangePriceInput}
                        onMinPriceInput={onLeftRangePriceInput}
                        onMaxPriceInput={onRightRangePriceInput}
                        formattedData={formattedData}
                        priceHistoryData={rateData}
                        axisTicks={axisTicks}
                        error={chartDataError}
                        interactive
                      />
                    </Box>
                  </>
                )}
              </DynamicSection>

              <DynamicSection disabled={!feeAmount || invalidPool || (noLiquidity && !startPriceTypedValue)} gap="16px">
                {!showCapitalEfficiencyWarning && (
                  <V3RangeSelector
                    priceLower={priceLower}
                    priceUpper={priceUpper}
                    getDecrementLower={getDecrementLower}
                    getIncrementLower={getIncrementLower}
                    getDecrementUpper={getDecrementUpper}
                    getIncrementUpper={getIncrementUpper}
                    onLeftRangeInput={onLeftRangeInput}
                    onRightRangeInput={onRightRangeInput}
                    currencyA={baseCurrency}
                    currencyB={quoteCurrency}
                    feeAmount={feeAmount}
                    ticksAtLimit={ticksAtLimit}
                    tickSpaceLimits={tickSpaceLimits}
                    quickAction={quickAction}
                    handleQuickAction={handleQuickAction}
                  />
                )}

                {showCapitalEfficiencyWarning && (
                  <Message variant="warning">
                    <Box>
                      <Text fontSize="16px">{t('Efficiency Comparison')}</Text>
                      <Text color="textSubtle">
                        {t('Full range positions may earn less fees than concentrated positions.')}
                      </Text>
                      <Button
                        mt="16px"
                        onClick={() => {
                          setShowCapitalEfficiencyWarning(false)
                          getSetFullRange()
                        }}
                        scale="md"
                        variant="danger"
                      >
                        {t('I understand')}
                      </Button>
                    </Box>
                  </Message>
                )}

                {displayMarketPriceSlippageWarning ? (
                  <MarketPriceSlippageWarning slippage={`${marketPriceSlippage?.toFixed(0)} %`} />
                ) : null}

                {outOfRange ? (
                  <Message variant="warning">
                    <RowBetween>
                      <Text ml="12px" fontSize="12px">
                        {t(
                          'Your position will not earn fees or be used in trades until the market price moves into your range.',
                        )}
                      </Text>
                    </RowBetween>
                  </Message>
                ) : null}
                {invalidRange ? (
                  <Message variant="warning">
                    <MessageText>
                      {t('Invalid range selected. The min price must be lower than the max price.')}
                    </MessageText>
                  </Message>
                ) : null}
              </DynamicSection>
            </AutoColumn>
          </CardBody>
        </Card>
      </LeftContainer>
      <Card style={{ height: 'fit-content' }}>
        <CardBody>
          <DynamicSection disabled={!baseCurrency || !quoteCurrency}>
            <FieldFeeLevel />
          </DynamicSection>
          <DynamicSection
            mt="16px"
            style={{
              gridAutoRows: 'max-content',
              gridAutoColumns: '100%',
            }}
            gap="8px"
            disabled={
              !feeAmount || invalidPool || (noLiquidity && !startPriceTypedValue) || (!priceLower && !priceUpper)
            }
          >
            <LockedDeposit locked={depositADisabled}>
              <Box mb="8px">
                <CurrencyInputPanelSimplify
                  showUSDPrice
                  maxAmount={maxAmounts[Field.CURRENCY_A]}
                  onMax={() => onFieldAInput(maxAmounts[Field.CURRENCY_A]?.toExact() ?? '')}
                  onPercentInput={(percent) =>
                    onFieldAInput(maxAmounts[Field.CURRENCY_A]?.multiply(new Percent(percent, 100))?.toExact() ?? '')
                  }
                  disableCurrencySelect
                  defaultValue={formattedAmounts[Field.CURRENCY_A] ?? '0'}
                  onUserInput={onFieldAInput}
                  showQuickInputButton
                  showMaxButton
                  currency={currencies[Field.CURRENCY_A]}
                  id="add-liquidity-input-tokena"
                  title={<PreTitle>{t('Deposit Amount')}</PreTitle>}
                />
              </Box>
            </LockedDeposit>

            <LockedDeposit locked={depositBDisabled}>
              <CurrencyInputPanelSimplify
                showUSDPrice
                maxAmount={maxAmounts[Field.CURRENCY_B]}
                onMax={() => onFieldBInput(maxAmounts[Field.CURRENCY_B]?.toExact() ?? '')}
                onPercentInput={(percent) =>
                  onFieldBInput(maxAmounts[Field.CURRENCY_B]?.multiply(new Percent(percent, 100))?.toExact() ?? '')
                }
                disableCurrencySelect
                defaultValue={formattedAmounts[Field.CURRENCY_B] ?? '0'}
                onUserInput={onFieldBInput}
                showQuickInputButton
                showMaxButton
                currency={currencies[Field.CURRENCY_B]}
                id="add-liquidity-input-tokenb"
                title={<>&nbsp;</>}
              />
            </LockedDeposit>
            <Column mt="16px" gap="16px">
              {canUseNativeCurrency && (
                <RowBetween>
                  <Text color="textSubtle">Use {native.symbol} instead</Text>
                  <Toggle scale="sm" checked={useNativeInstead} onChange={handleUseNative} />
                </RowBetween>
              )}
              <RowBetween>
                <Text color="textSubtle">{t('Total')}</Text>
                <Text>~{formatDollarAmount(totalUsdValue, 2, false)}</Text>
              </RowBetween>
              <RowBetween>
                <Text color="textSubtle">{t('Slippage Tolerance')}</Text>
                <LiquiditySlippageButton />
              </RowBetween>
            </Column>
            <Box mt="8px">{buttons}</Box>
          </DynamicSection>
        </CardBody>
      </Card>
    </>
  )
}
