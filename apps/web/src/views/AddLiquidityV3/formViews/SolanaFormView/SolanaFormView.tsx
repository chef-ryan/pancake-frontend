import Decimal from 'decimal.js'
import BN from 'bn.js'
import { Protocol } from '@pancakeswap/farms'
import { useTranslation } from '@pancakeswap/localization'
import {
  Price,
  UnifiedCurrency,
  UnifiedCurrencyAmount,
  Percent,
  isUnifedCurrencySorted,
  Token,
  SPLToken,
} from '@pancakeswap/swap-sdk-core'
import { isSolWSol } from '@pancakeswap/sdk'
import { useUnifiedUSDPriceAmount } from 'hooks/useStablecoinPrice'
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
  useMatchBreakpoints,
  useModal,
  useTooltip,
} from '@pancakeswap/uikit'
import { useIsExpertMode } from '@pancakeswap/utils/user'
import { FeeAmount } from '@pancakeswap/v3-sdk'
import {
  ConfirmationModalContent,
  Liquidity,
  NumericalInput,
  PricePeriodRangeChart,
  ZOOM_LEVELS,
  ZoomLevels,
  DoubleCurrencyLogo,
} from '@pancakeswap/widgets-internal'
import BigNumber from 'bignumber.js'
import CurrencyInputPanelSimplify from 'components/CurrencyInputPanelSimplify'
import TransactionConfirmationModal from 'components/TransactionConfirmationModal'
import { LightGreyCard } from 'components/Card'
import Divider from 'components/Divider'
import CurrencyLogo from 'components/Logo/CurrencyLogo'
import { RangePriceSection } from 'components/RangePriceSection'
import { RangeTag } from 'components/RangeTag'
import { Bound } from 'config/constants/types'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { usePoolMarketPriceSlippage } from 'hooks/usePoolMarketPriceSlippage'
import { tryParsePrice } from 'hooks/v3/utils'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { styled } from 'styled-components'
import { logGTMClickAddLiquidityConfirmEvent, logGTMClickAddLiquidityEvent } from 'utils/customGTMEventTracking'
import { formatPrice } from 'utils/formatCurrencyAmount'
import { maxUnifiedAmountSpend } from 'utils/maxAmountSpend'
import { CurrencyField as Field } from 'utils/types'
import { useTokenRateData } from 'views/AddLiquidityInfinity/components/useTokenToTokenRateData'
import { getAxisTicks } from 'views/AddLiquidityInfinity/utils'
import { SolanaSubmitButton } from 'views/CreateLiquidityPool/components/Solana/SolanaSubmitButton'
import { useSolanaDensityChartData } from 'views/AddLiquidityV3/hooks/useSolanaDensityChartData'
import {
  useCurrencyInversionEvent,
  useHeaderInvertCurrencies,
} from 'views/AddLiquidityV3/hooks/useHeaderInvertCurrencies'
import { QUICK_ACTION_CONFIGS } from 'views/AddLiquidityV3/types'
import { MarketPriceSlippageWarning } from 'views/CreateLiquidityPool/components/SubmitCreateButton'
import { Dot } from 'views/Notifications/styles'
import { LiquiditySlippageButton } from 'views/Swap/components/SlippageButton'
import { formatDollarAmount } from 'views/V3Info/utils/numbers'
import { useSolanaDerivedInfo } from 'hooks/solana/useSolanaDerivedInfo'
import { useSolanaPoolByMint } from 'hooks/solana/useSolanaPoolsByMint'
import { FieldFeeLevel } from 'views/CreateLiquidityPool/components/V3/FieldFeeLevel'
import { useRangeHopCallbacks } from 'views/CreateLiquidityPool/hooks/useRangeHopCallbacks'
import { formatTickPrice } from 'hooks/v3/utils/formatTickPrice'
import { TxVersion } from '@pancakeswap/solana-core-sdk'
import { useRaydium } from 'hooks/solana/useRaydium'
import { usePreviousValue } from '@pancakeswap/hooks'
import { useCreateClmmPool } from 'hooks/solana/useCreateClmmPool'
import { useUnifiedTokenUsdPrice } from 'hooks/useUnifiedTokenUsdPrice'
import { useQuickActionConfigs } from 'views/AddLiquidityV3/hooks/useQuickActionConfigs'

import LockedDeposit from '../V3FormView/components/LockedDeposit'
import { RangeSelector } from './RangeSelector'
import { useV3MintActionHandlers } from '../V3FormView/form/hooks/useV3MintActionHandlers'
import { useV3FormAddLiquidityCallback, useV3FormState } from '../V3FormView/form/reducer'
import { useInitialRange } from '../V3FormView/form/hooks/useInitialRange'

const StyledInput = styled(NumericalInput)`
  background-color: ${({ theme }) => theme.colors.input};
  box-shadow: ${({ theme, error }) => theme.shadows[error ? 'warning' : 'inset']};
  border-radius: 16px;
  padding: 8px 16px;
  font-size: 16px;
  width: 100%;
  margin-bottom: 16px;
`

const LeftContainer = styled(AutoColumn)`
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
  baseCurrency?: UnifiedCurrency
  quoteCurrency?: UnifiedCurrency
  currencyIdA?: string
  currencyIdB?: string
  feeAmount?: number
}

export function SolanaFormView({
  feeAmount,
  baseCurrency,
  quoteCurrency,
  currencyIdA,
  currencyIdB,
}: SolanaFormViewPropsType) {
  const router = useRouter()
  const { isMobile } = useMatchBreakpoints()

  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirm
  const [txnErrorMessage, setTxnErrorMessage] = useState<string | undefined>()

  const {
    t,
    currentLanguage: { locale },
  } = useTranslation()
  const expertMode = useIsExpertMode()
  const previousFeeAmount = usePreviousValue(feeAmount)

  const { data: solPoolInfo } = useSolanaPoolByMint(
    baseCurrency?.wrapped?.address,
    quoteCurrency?.wrapped?.address,
    feeAmount,
  )

  const { solanaAccount: account, isWrongNetwork } = useAccountActiveChain()
  const [pricePeriod, setPricePeriod] = useState<Liquidity.PresetRangeItem>(Liquidity.PRESET_RANGE_ITEMS[0])
  const axisTicks = useMemo(() => getAxisTicks(pricePeriod.value, isMobile), [pricePeriod.value, isMobile])

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
    invalidPool,
    invalidRange,
    outOfRange,
    depositADisabled,
    depositBDisabled,
    invertPrice,
    ticksAtLimit,
    tickSpaceLimits,
  } = useSolanaDerivedInfo(baseCurrency, quoteCurrency, feeAmount, baseCurrency, undefined, formState)
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

  // capital efficiency warning
  const [showCapitalEfficiencyWarning, setShowCapitalEfficiencyWarning] = useState<boolean>(false)

  useEffect(() => {
    setShowCapitalEfficiencyWarning(false)
  }, [baseCurrency, quoteCurrency, feeAmount])

  useEffect(() => {
    if (feeAmount && previousFeeAmount !== feeAmount) {
      setActiveQuickAction(undefined)
      onBothRangeInput({
        leftTypedValue: undefined,
        rightTypedValue: undefined,
      })
    }
    // NOTE: ignore exhaustive-deps to avoid infinite re-render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feeAmount])

  // todo:@eric
  useInitialRange(baseCurrency?.wrapped as Token, quoteCurrency?.wrapped as Token)

  const onAddLiquidityCallback = useV3FormAddLiquidityCallback()

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
  const usdA = useUnifiedUSDPriceAmount(
    parsedAmounts[Field.CURRENCY_A]?.currency,
    parsedAmounts[Field.CURRENCY_A] ? Number(parsedAmounts[Field.CURRENCY_A]?.toExact()) : undefined,
    { enabled: Boolean(parsedAmounts[Field.CURRENCY_A]) },
  )
  const usdB = useUnifiedUSDPriceAmount(
    parsedAmounts[Field.CURRENCY_B]?.currency,
    parsedAmounts[Field.CURRENCY_B] ? Number(parsedAmounts[Field.CURRENCY_B]?.toExact()) : undefined,
    { enabled: Boolean(parsedAmounts[Field.CURRENCY_B]) },
  )
  const totalUsdValue = (usdA ?? 0) + (usdB ?? 0)

  // Get the max amounts user can add
  const maxAmounts: { [field in Field]?: UnifiedCurrencyAmount<UnifiedCurrency> } = useMemo(
    () =>
      [Field.CURRENCY_A, Field.CURRENCY_B].reduce((accumulator, field) => {
        return {
          ...accumulator,
          [field]: maxUnifiedAmountSpend(currencyBalances[field] as UnifiedCurrencyAmount<UnifiedCurrency> | undefined),
        }
      }, {}),
    [currencyBalances],
  )

  const handleFeePoolSelect = useCallback(
    (_idx: number, newFeeAmount: number) => {
      if (!newFeeAmount || !router.isReady) {
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

  const raydium = useRaydium()

  const handleDismissConfirmation = useCallback(() => {
    // if there was a tx hash, we want to clear the input
    if (txHash) {
      onFieldAInput('')
    }
    setTxHash('')
    setTxnErrorMessage(undefined)
  }, [onFieldAInput, txHash])

  const { [Bound.LOWER]: priceLower, [Bound.UPPER]: priceUpper } = pricesAtTicks
  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks

  const { getDecrementLower, getIncrementLower, getDecrementUpper, getIncrementUpper, getSetFullRange } =
    useRangeHopCallbacks(baseCurrency, quoteCurrency, feeAmount, tickLower, tickUpper, pool)
  // we need an existence check on parsed amounts for single-asset deposits
  const translationData = useMemo(() => {
    if (depositADisabled) {
      return {
        amount: parsedAmounts[Field.CURRENCY_B]?.toSignificant(4) ?? '-',
        symbol: currencies[Field.CURRENCY_B]?.symbol ? currencies[Field.CURRENCY_B].symbol : '',
      }
    }
    if (depositBDisabled) {
      return {
        amount: parsedAmounts[Field.CURRENCY_A]?.toSignificant(4) ?? '-',
        symbol: currencies[Field.CURRENCY_A]?.symbol ? currencies[Field.CURRENCY_A].symbol : '',
      }
    }
    return {
      amountA: parsedAmounts[Field.CURRENCY_A]?.toSignificant(4) ?? '-',
      symbolA: currencies[Field.CURRENCY_A]?.symbol ? currencies[Field.CURRENCY_A].symbol : '',
      amountB: parsedAmounts[Field.CURRENCY_B]?.toSignificant(4) ?? '-',
      symbolB: currencies[Field.CURRENCY_B]?.symbol ? currencies[Field.CURRENCY_B].symbol : '',
    }
  }, [depositADisabled, depositBDisabled, parsedAmounts, currencies])

  const pendingText = useMemo(
    () =>
      !outOfRange
        ? t('Supplying %amountA% %symbolA% and %amountB% %symbolB%', translationData)
        : t('Supplying %amount% %symbol%', translationData),
    [t, outOfRange, translationData],
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

  const [activeQuickAction, setActiveQuickAction] = useState<number>()
  const isQuickButtonUsed = useRef(false)
  const [quickAction, setQuickAction] = useState<number | null>(null)
  const [customZoomLevel, setCustomZoomLevel] = useState<ZoomLevels | undefined>(undefined)

  const createClmm = useCreateClmmPool()
  const addLiquidity = useCallback(async () => {
    const poolInfo = solPoolInfo?.rawPool as any
    const currencyA = currencies[Field.CURRENCY_A]
    const mintAAddr = (solPoolInfo?.token0 as any)?.address
    const baseIsMintA = currencyA?.wrapped?.address === mintAAddr
    const amountAQuot = parsedAmounts[Field.CURRENCY_A]?.quotient
    const amountBQuot = parsedAmounts[Field.CURRENCY_B]?.quotient
    const mintAAmount = new BN((baseIsMintA ? amountAQuot : amountBQuot)?.toString() ?? '0')
    const mintBAmount = new BN((baseIsMintA ? amountBQuot : amountAQuot)?.toString() ?? '0')

    if (mintAAmount.isZero() && mintBAmount.isZero()) {
      setTxnErrorMessage(t('Enter an amount'))
      return { txId: '' }
    }
    const base: 'MintA' | 'MintB' = baseIsMintA ? 'MintA' : 'MintB'
    const baseAmount = baseIsMintA ? mintAAmount : mintBAmount
    const otherAmountMax = baseIsMintA ? mintBAmount : mintAAmount

    const build = await raydium?.clmm.openPositionFromBase({
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

    if (!build) {
      return { txId: '' }
    }
    return build?.execute()
  }, [currencies, parsedAmounts, raydium?.clmm, solPoolInfo?.rawPool, solPoolInfo?.token0, t, ticks])

  const onAdd = useCallback(async () => {
    logGTMClickAddLiquidityConfirmEvent()
    try {
      if (!baseCurrency || !quoteCurrency) return
      if (!raydium) return
      if (!ticks?.[Bound.LOWER] || !ticks?.[Bound.UPPER]) return

      setAttemptingTxn(true)

      let hash = ''
      if (noLiquidity && feeAmount && price) {
        const { txId, openPositionTxId } = await createClmm({
          mintA: baseCurrency.wrapped as SPLToken,
          mintB: quoteCurrency.wrapped as SPLToken,
          tradeFeeRate: feeAmount,
          initialPrice: parseFloat(price.toSignificant(18)),
          position:
            typeof tickLower === 'number' && typeof tickUpper === 'number'
              ? {
                  tickLower,
                  tickUpper,
                  amountA: parsedAmounts[isSorted ? Field.CURRENCY_A : Field.CURRENCY_B] as any,
                  amountB: parsedAmounts[isSorted ? Field.CURRENCY_B : Field.CURRENCY_A] as any,
                }
              : undefined,
        })
        hash = txId ?? openPositionTxId
      } else {
        const { txId } = await addLiquidity()
        hash = txId
      }

      setAttemptingTxn(false)
      setTxHash(hash)
      onAddLiquidityCallback(hash)
    } catch (e: any) {
      setAttemptingTxn(false)
      setTxnErrorMessage(e?.message ?? 'Failed to add liquidity')
    }
  }, [
    addLiquidity,
    createClmm,
    feeAmount,
    isSorted,
    noLiquidity,
    price,
    tickLower,
    tickUpper,
    baseCurrency,
    quoteCurrency,
    parsedAmounts,
    ticks,
    onAddLiquidityCallback,
    raydium,
  ])

  const confirmationContent = useCallback(() => {
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
                      ~{formatDollarAmount(usdA)}
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
                      ~{formatDollarAmount(usdB)}
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
                  currency0={(isSorted ? quoteCurrency : baseCurrency) ?? undefined}
                  currency1={(isSorted ? baseCurrency : quoteCurrency) ?? undefined}
                  price={formatTickPrice(minPrice, ticksAtLimit, Bound.LOWER, locale)}
                />
                <RangePriceSection
                  width="48%"
                  title={t('Max Price')}
                  currency0={(isSorted ? quoteCurrency : baseCurrency) ?? undefined}
                  currency1={(isSorted ? baseCurrency : quoteCurrency) ?? undefined}
                  price={formatTickPrice(maxPrice, ticksAtLimit, Bound.UPPER, locale)}
                />
              </RowBetween>
              <RangePriceSection
                title={t('Current Price')}
                currency0={(isSorted ? quoteCurrency : baseCurrency) ?? undefined}
                currency1={(isSorted ? baseCurrency : quoteCurrency) ?? undefined}
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
  }, [
    baseCurrency,
    currencies,
    displayedPrice,
    feeAmount,
    isSorted,
    locale,
    maxPrice,
    minPrice,
    onAdd,
    outOfRange,
    parsedAmounts,
    pool,
    quoteCurrency,
    t,
    ticksAtLimit,
    totalUsdValue,
    usdA,
    usdB,
  ])

  const [onPresentAddLiquidityModal] = useModal(
    <TransactionConfirmationModal
      minWidth={['100%', null, '420px']}
      title={t('Add Liquidity')}
      customOnDismiss={handleDismissConfirmation}
      attemptingTxn={attemptingTxn}
      hash={txHash}
      errorMessage={txnErrorMessage}
      content={confirmationContent}
      pendingText={pendingText}
    />,
    true,
    true,
    'TransactionConfirmationModal',
  )

  const handleButtonSubmit = useCallback(() => {
    if (expertMode) {
      onAdd()
    } else {
      onPresentAddLiquidityModal()
    }
    logGTMClickAddLiquidityEvent()
  }, [expertMode, onAdd, onPresentAddLiquidityModal])

  const poolCurrentPrice = useMemo(() => {
    if (!pool) return undefined
    return new Price(pool.token0 as any, pool.token1 as any, 2n ** 192n, pool.sqrtRatioX96 * pool.sqrtRatioX96)
  }, [pool])

  // Current token prices
  const { data: baseCurrencyCurrentPrice } = useUnifiedTokenUsdPrice(baseCurrency)
  const { data: quoteCurrencyCurrentPrice } = useUnifiedTokenUsdPrice(quoteCurrency)
  const currentPrice = useMemo(() => {
    if (!baseCurrencyCurrentPrice || !quoteCurrencyCurrentPrice) return undefined
    return new Decimal(baseCurrencyCurrentPrice).dividedBy(quoteCurrencyCurrentPrice)
  }, [baseCurrencyCurrentPrice, quoteCurrencyCurrentPrice])

  const [, marketPriceSlippage] = usePoolMarketPriceSlippage(baseCurrency, quoteCurrency, poolCurrentPrice)
  const displayMarketPriceSlippageWarning = useMemo(() => {
    if (marketPriceSlippage === undefined) return false
    const slippage = new BigNumber(marketPriceSlippage.toFixed(0)).abs()
    return slippage.gt(5) // 5% slippage
  }, [marketPriceSlippage])

  const buttons = (
    <SolanaSubmitButton
      addIsUnsupported={false}
      addIsWarning={false}
      account={account ?? undefined}
      isWrongNetwork={Boolean(isWrongNetwork)}
      isValid={isValid}
      parsedAmounts={parsedAmounts as any}
      onClick={handleButtonSubmit}
      attemptingTxn={attemptingTxn}
      errorMessage={errorMessage}
      buttonText={t('Add')}
      depositADisabled={depositADisabled}
      depositBDisabled={depositBDisabled}
    />
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
    [feeAmount, handleRefresh, setShowCapitalEfficiencyWarning],
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
    baseCurrency: baseCurrency ?? undefined,
    quoteCurrency: quoteCurrency ?? undefined,
    chainId: baseCurrency?.chainId,
    protocol: Protocol.V3,
    poolId: solPoolInfo?.poolId,
  })

  const handleUseCurrentPrice = useCallback(() => {
    onStartPriceInput(currentPrice?.toSignificantDigits(18).toString() ?? '')
  }, [currentPrice, onStartPriceInput])

  const {
    tooltip: currentPriceTooltip,
    tooltipVisible: currentPriceTooltipVisible,
    targetRef: currentPriceTargetRef,
  } = useTooltip(t('The price is an estimation of the current market price. Please verify before using it.'), {
    placement: 'bottom',
    avoidToStopPropagation: true,
  })

  const quickActionConfigs = useQuickActionConfigs({
    defaultRangePoints: solPoolInfo?.rawPool?.config?.defaultRangePoint,
    feeAmount,
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
                            {currentPrice.toNumber()} {quoteCurrency?.symbol} per {baseCurrency?.symbol}
                          </Text>
                          <SwapHorizIcon
                            role="button"
                            color="primary60"
                            onClick={handleInvertStartPriceCurrencies}
                            style={{ cursor: 'pointer' }}
                          />
                        </FlexGap>
                      </FlexGap>
                    ) : null}
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
                          customZoomLevel || (activeQuickAction ? quickActionConfigs?.[activeQuickAction] : undefined)
                        }
                        baseCurrency={baseCurrency as any}
                        quoteCurrency={quoteCurrency as any}
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
                  <RangeSelector
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
                    defaultRangePoints={solPoolInfo?.rawPool?.config?.defaultRangePoint}
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
            <FieldFeeLevel
              baseCurrency={baseCurrency ?? undefined}
              quoteCurrency={quoteCurrency ?? undefined}
              onSelect={handleFeePoolSelect}
              feeAmount={feeAmount}
            />
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
                  maxDecimals={currencies[Field.CURRENCY_A]?.decimals}
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
                maxDecimals={currencies[Field.CURRENCY_B]?.decimals}
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
