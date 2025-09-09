import { useTranslation } from '@pancakeswap/localization'
import {
  Currency,
  Price,
  sortUnifiedCurrencies,
  Token,
  UnifiedCurrency,
  UnifiedCurrencyAmount,
} from '@pancakeswap/swap-sdk-core'
import { FeeAmount, Pool, Position, TickMath, encodeSqrtRatioX96, priceToClosestTick } from '@pancakeswap/v3-sdk'
import { Bound } from 'config/constants/types'
import { ReactNode, useMemo } from 'react'
import { TickUtils } from '@pancakeswap/solana-core-sdk'
import tryParseAmount from '@pancakeswap/utils/tryParseAmount'
import Decimal from 'decimal.js'
import { UnifiedBalance, useUnifiedCurrencyBalances } from 'hooks/useUnifiedCurrencyBalance'
import tryParseCurrencyAmount from 'utils/tryParseCurrencyAmount'
import { CurrencyField as Field } from 'utils/types'
import { MintState } from 'views/AddLiquidityV3/formViews/V3FormView/form/reducer'
import { useAccountActiveChain } from 'hooks/useAccountActiveChain'
import { useBirdeyeTokenPrice } from 'hooks/solana/useBirdeyeTokenPrice'
import { useClmmAmmConfigs } from 'hooks/solana/useClmmAmmConfigs'
import { useGetTickPrice } from './useGetTickPrice'
import { useDependentAmountFromClmm } from './useDependentAmountFromClmm'

export enum PoolState {
  LOADING,
  EXISTS,
  NOT_EXISTS,
  INVALID,
}

function tryParseTickSolana(
  tickSpacing: number | undefined,
  price: MintState['leftRangeTypedValue'] | MintState['rightRangeTypedValue'],
  token0?: Token,
  token1?: Token,
): number | undefined {
  if (!price || !tickSpacing || typeof price === 'boolean' || !token0 || !token1) return undefined
  try {
    const poolInfo = {
      config: { tickSpacing },
      mintA: { decimals: token0.decimals },
      mintB: { decimals: token1.decimals },
    } as any
    const pDec = new Decimal(price.toSignificant(18))
    const res = TickUtils.getPriceAndTick({ poolInfo, price: pDec, baseIn: true })
    return res?.tick
  } catch {
    return undefined
  }
}

const checkAndParseMaxTick = (tick: number) => (tick === TickMath.MAX_TICK ? TickMath.MAX_TICK - 1 : tick)

export const useSolanaDerivedInfo = (
  currencyA?: UnifiedCurrency,
  currencyB?: UnifiedCurrency,
  feeAmount?: FeeAmount,
  baseCurrency?: UnifiedCurrency,
  existingPosition?: Position,
  formState?: MintState,
): {
  pool?: Pool | null
  poolState: PoolState
  ticks: { [bound in Bound]?: number | undefined }
  price?: Price<Token, Token>
  pricesAtTicks: { [bound in Bound]?: Price<Currency, Currency> | undefined }
  currencies: { [field in Field]?: UnifiedCurrency }
  currencyBalances: { [field in Field]?: UnifiedBalance }
  dependentField: Field
  parsedAmounts: { [field in Field]?: UnifiedCurrencyAmount<UnifiedCurrency> }
  noLiquidity: boolean
  errorMessage?: ReactNode
  hasInsufficentBalance: boolean
  invalidPool: boolean
  outOfRange: boolean
  invalidRange: boolean
  depositADisabled: boolean
  depositBDisabled: boolean
  invertPrice: boolean
  ticksAtLimit: { [bound in Bound]?: boolean | undefined }
  tickSpaceLimits: { [bound in Bound]: number | undefined }
} => {
  const { t } = useTranslation()
  const { unifiedAccount: account } = useAccountActiveChain()
  const ammConfigs = useClmmAmmConfigs()

  const { independentField, typedValue, leftRangeTypedValue, rightRangeTypedValue, startPriceTypedValue } =
    formState || {}

  const dependentField = independentField === Field.CURRENCY_A ? Field.CURRENCY_B : Field.CURRENCY_A

  const currencies: { [field in Field]?: UnifiedCurrency } = useMemo(
    () => ({
      [Field.CURRENCY_A]: currencyA,
      [Field.CURRENCY_B]: currencyB,
    }),
    [currencyA, currencyB],
  )

  const [token0, token1, baseToken] = useMemo(() => {
    const [currencyA_, currencyB_] =
      currencyA && currencyB ? sortUnifiedCurrencies([currencyA, currencyB]) : [currencyA, currencyB]
    return [currencyA_?.wrapped, currencyB_?.wrapped, baseCurrency?.wrapped]
  }, [currencyA, currencyB, baseCurrency])

  const balances = useUnifiedCurrencyBalances(
    useMemo(() => [currencies[Field.CURRENCY_A], currencies[Field.CURRENCY_B]], [currencies]),
  )
  const currencyBalances = useMemo(
    () => ({
      [Field.CURRENCY_A]: balances?.[0],
      [Field.CURRENCY_B]: balances?.[1],
    }),
    [balances],
  )

  // Solana tickSpacing by feeAmount (must match a config)
  const tickSpacing: number | undefined = useMemo(() => {
    if (!feeAmount) return undefined
    const cfg = Object.values(ammConfigs).find((c) => c.tradeFeeRate === feeAmount)
    return cfg?.tickSpacing
  }, [ammConfigs, feeAmount])

  // Birdeye prices for market price fallback
  const baseMint = token0?.address
  const quoteMint = token1?.address
  const { data: beePrices } = useBirdeyeTokenPrice({
    mintList: [baseMint, quoteMint],
    enabled: Boolean(baseMint && quoteMint),
  })

  const invertPrice = Boolean(baseToken && token0 && !baseToken.equals(token0))

  const price: Price<Token, Token> | undefined = useMemo(() => {
    if (startPriceTypedValue) {
      const parsedQuoteAmount = tryParseCurrencyAmount(startPriceTypedValue, (invertPrice ? token0 : token1) as Token)
      if (parsedQuoteAmount && token0 && token1) {
        const baseAmount = tryParseCurrencyAmount('1', (invertPrice ? token1 : token0) as Token)
        const p =
          baseAmount && parsedQuoteAmount
            ? new Price(
                baseAmount.currency as Token,
                parsedQuoteAmount.currency as Token,
                baseAmount.quotient,
                parsedQuoteAmount.quotient,
              )
            : undefined
        return (invertPrice ? p?.invert() : p) ?? undefined
      }
    }
    if (token0 && token1 && beePrices) {
      const p0 = beePrices[token0.address]?.value
      const p1 = beePrices[token1.address]?.value
      if (p0 && p1) {
        const ratio = p1 / p0
        const scale = 1_000_000n
        const baseQ = scale
        const quoteQ = BigInt(Math.max(1, Math.round(ratio * Number(scale))))
        const p = new Price(token0 as Token, token1 as Token, baseQ, quoteQ)
        return invertPrice ? p.invert() : p
      }
    }
    return undefined
  }, [startPriceTypedValue, invertPrice, token0, token1, beePrices])

  const invalidPrice = useMemo(() => {
    const sqrtRatioX96 = price ? encodeSqrtRatioX96(price.numerator, price.denominator) : undefined
    return price && sqrtRatioX96 && !(sqrtRatioX96 >= TickMath.MIN_SQRT_RATIO && sqrtRatioX96 < TickMath.MAX_SQRT_RATIO)
  }, [price])

  const mockPool = useMemo(() => {
    if (!token0 || !token1 || !feeAmount || !price || invalidPrice) return undefined
    try {
      const currentTick = priceToClosestTick(price)
      const currentSqrt = TickMath.getSqrtRatioAtTick(currentTick)
      return new Pool(token0 as Token, token1 as Token, feeAmount, currentSqrt, 0n, currentTick, [])
    } catch {
      return undefined
    }
  }, [feeAmount, invalidPrice, price, token0, token1])

  const poolState = PoolState.NOT_EXISTS
  const noLiquidity = true
  const poolForPosition: Pool | undefined = mockPool

  // Solana CLMM full range bounds are limited to ±443636 ticks (Raydium convention)
  const tickSpaceLimits: { [bound in Bound]: number | undefined } = useMemo(() => {
    if (tickSpacing === undefined) return { [Bound.LOWER]: undefined, [Bound.UPPER]: undefined }
    const SOLANA_TICK_LIMIT = 443636
    const lower = Math.floor(-SOLANA_TICK_LIMIT / tickSpacing) * tickSpacing
    const upper = Math.floor(SOLANA_TICK_LIMIT / tickSpacing) * tickSpacing
    return {
      [Bound.LOWER]: lower,
      [Bound.UPPER]: upper,
    }
  }, [tickSpacing])

  const getSolTickPrice = useGetTickPrice(token0, token1, feeAmount)

  const ticks: { [key: string]: number | undefined } = useMemo(() => {
    return {
      [Bound.LOWER]:
        typeof existingPosition?.tickLower === 'number'
          ? existingPosition.tickLower
          : (invertPrice && typeof rightRangeTypedValue === 'boolean') ||
            (!invertPrice && typeof leftRangeTypedValue === 'boolean')
          ? tickSpaceLimits[Bound.LOWER]
          : invertPrice
          ? tryParseTickSolana(tickSpacing, rightRangeTypedValue, token0 as Token, token1 as Token)
          : tryParseTickSolana(tickSpacing, leftRangeTypedValue, token0 as Token, token1 as Token),
      [Bound.UPPER]:
        typeof existingPosition?.tickUpper === 'number'
          ? checkAndParseMaxTick(existingPosition.tickUpper)
          : (!invertPrice && typeof rightRangeTypedValue === 'boolean') ||
            (invertPrice && typeof leftRangeTypedValue === 'boolean')
          ? tickSpaceLimits[Bound.UPPER]
          : invertPrice
          ? tryParseTickSolana(tickSpacing, leftRangeTypedValue, token0 as Token, token1 as Token)
          : tryParseTickSolana(tickSpacing, rightRangeTypedValue, token0 as Token, token1 as Token),
    }
  }, [
    existingPosition,
    invertPrice,
    leftRangeTypedValue,
    rightRangeTypedValue,
    tickSpaceLimits,
    tickSpacing,
    token0,
    token1,
  ])

  const { [Bound.LOWER]: tickLower, [Bound.UPPER]: tickUpper } = ticks || {}

  const ticksAtLimit = useMemo(
    () => ({
      [Bound.LOWER]: tickLower === tickSpaceLimits.LOWER,
      [Bound.UPPER]: tickUpper === tickSpaceLimits.UPPER,
    }),
    [tickSpaceLimits, tickLower, tickUpper],
  )

  const invalidRange = Boolean(typeof tickLower === 'number' && typeof tickUpper === 'number' && tickLower >= tickUpper)

  const pricesAtTicks = useMemo(() => {
    return {
      [Bound.LOWER]:
        typeof ticks[Bound.LOWER] === 'number' ? getSolTickPrice(ticks[Bound.LOWER] as number)?.price : undefined,
      [Bound.UPPER]:
        typeof ticks[Bound.UPPER] === 'number' ? getSolTickPrice(ticks[Bound.UPPER] as number)?.price : undefined,
    }
  }, [getSolTickPrice, ticks])

  const { [Bound.LOWER]: lowerPrice, [Bound.UPPER]: upperPrice } = pricesAtTicks

  const outOfRange = Boolean(
    !invalidRange && price && lowerPrice && upperPrice && (price.lessThan(lowerPrice) || price.greaterThan(upperPrice)),
  )

  const independentAmount = useMemo(
    () => tryParseAmount(typedValue, independentField ? currencies[independentField] : undefined),
    [typedValue, currencies, independentField],
  )

  const dependentAmount = useDependentAmountFromClmm({
    independentAmount,
    token0,
    token1,
    tickSpacing,
    price: price?.toSignificant(18),
    tickLower,
    tickUpper,
    outOfRange,
    invalidRange,
    dependentCurrency: dependentField === Field.CURRENCY_B ? currencyB : currencyA,
  })

  const parsedAmounts = useMemo(() => {
    return {
      [Field.CURRENCY_A]: independentField === Field.CURRENCY_A ? independentAmount : dependentAmount,
      [Field.CURRENCY_B]: independentField === Field.CURRENCY_A ? dependentAmount : independentAmount,
    }
  }, [dependentAmount, independentAmount, independentField])

  const deposit0Disabled = Boolean(
    typeof tickUpper === 'number' && poolForPosition && poolForPosition.tickCurrent >= tickUpper,
  )
  const deposit1Disabled = Boolean(
    typeof tickLower === 'number' && poolForPosition && poolForPosition.tickCurrent <= tickLower,
  )

  const depositADisabled =
    invalidRange ||
    Boolean(
      (deposit0Disabled && poolForPosition && token0 && poolForPosition.token0.equals(token0)) ||
        (deposit1Disabled && poolForPosition && token0 && poolForPosition.token1.equals(token0)),
    )
  const depositBDisabled =
    invalidRange ||
    Boolean(
      (deposit0Disabled && poolForPosition && token1 && poolForPosition.token0.equals(token1)) ||
        (deposit1Disabled && poolForPosition && token1 && poolForPosition.token1.equals(token1)),
    )

  /* const position: Position | undefined = useMemo(() => {
    if (
      !poolForPosition ||
      !token0 ||
      !token1 ||
      typeof tickLower !== 'number' ||
      typeof tickUpper !== 'number' ||
      invalidRange
    ) {
      return undefined
    }

    const amount0 = !deposit0Disabled
      ? parsedAmounts?.[token0.equals(poolForPosition.token0) ? Field.CURRENCY_A : Field.CURRENCY_B]?.quotient
      : BIG_INT_ZERO
    const amount1 = !deposit1Disabled
      ? parsedAmounts?.[token0.equals(poolForPosition.token0) ? Field.CURRENCY_B : Field.CURRENCY_A]?.quotient
      : BIG_INT_ZERO

    if (amount0 !== undefined && amount1 !== undefined) {
      return Position.fromAmounts({
        pool: poolForPosition,
        tickLower,
        tickUpper,
        amount0,
        amount1,
        useFullPrecision: true,
      })
    }
    return undefined
  }, [
    parsedAmounts,
    poolForPosition,
    token0,
    token1,
    deposit0Disabled,
    deposit1Disabled,
    invalidRange,
    tickLower,
    tickUpper,
  ]) */

  let hasInsufficentBalance = false
  let errorMessage: ReactNode | undefined
  if (!account) {
    errorMessage = t('Connect Wallet')
  }

  if (invalidPrice) {
    errorMessage = errorMessage ?? t('Invalid price input')
  }

  if (
    (!parsedAmounts[Field.CURRENCY_A] && !depositADisabled) ||
    (!parsedAmounts[Field.CURRENCY_B] && !depositBDisabled)
  ) {
    errorMessage = errorMessage ?? t('Enter an amount')
  }

  const { [Field.CURRENCY_A]: currencyAAmount, [Field.CURRENCY_B]: currencyBAmount } = parsedAmounts

  if (
    currencyAAmount &&
    (currencyAAmount?.equalTo?.(0) || currencyBalances?.[Field.CURRENCY_A]?.lessThan?.(currencyAAmount))
  ) {
    hasInsufficentBalance = true
    errorMessage = t('Insufficient %symbol% balance', { symbol: currencies[Field.CURRENCY_A]?.symbol ?? '' })
  }

  if (
    currencyBAmount &&
    (currencyBAmount?.equalTo?.(0) || currencyBalances?.[Field.CURRENCY_B]?.lessThan?.(currencyBAmount))
  ) {
    hasInsufficentBalance = true
    errorMessage = t('Insufficient %symbol% balance', { symbol: currencies[Field.CURRENCY_B]?.symbol ?? '' })
  }

  const invalidPool = false

  return {
    dependentField,
    currencies,
    pool: mockPool ?? undefined,
    poolState,
    currencyBalances,
    parsedAmounts,
    ticks,
    price,
    pricesAtTicks,
    // position,
    noLiquidity,
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
  }
}
