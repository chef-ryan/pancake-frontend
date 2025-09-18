import { TickUtils, TokenInfo } from '@pancakeswap/solana-core-sdk'
import { Percent, Price } from '@pancakeswap/swap-sdk-core'
import { convertRawTokenInfoIntoSPLToken } from 'config/solana-list'
import { useMemo } from 'react'
import { SolanaV3Pool } from 'state/pools/solana'
import BigNumber from 'bignumber.js'
import { calculateSolanaTickLimits, getTickAtLimitStatus } from 'views/PoolDetail/utils'
import { Bound } from '@pancakeswap/widgets-internal'

export type PriceRangeProps = {
  tickLower: number
  tickUpper: number
  baseIn: boolean
  poolInfo?: SolanaV3Pool
}

export const usePriceRange = ({ tickLower, tickUpper, baseIn, poolInfo }: PriceRangeProps) => {
  const currency0 = useMemo(() => convertRawTokenInfoIntoSPLToken(poolInfo?.mintA as TokenInfo), [poolInfo?.mintA])
  const currency1 = useMemo(() => convertRawTokenInfoIntoSPLToken(poolInfo?.mintB as TokenInfo), [poolInfo?.mintB])
  const tickAtLimit = useMemo(() => {
    const tickLimits = calculateSolanaTickLimits(poolInfo?.config.tickSpacing)
    return getTickAtLimitStatus(tickLower, tickUpper, tickLimits)
  }, [poolInfo?.config.tickSpacing, tickLower, tickUpper])
  const currentPrice = useMemo(() => {
    if (!currency0 || !currency1 || !poolInfo) {
      return undefined
    }
    const price = Price.fromDecimal(currency0, currency1, new BigNumber(poolInfo.price.toString()).toFixed())
    return baseIn ? price : price?.invert()
  }, [currency0, currency1, poolInfo, baseIn])
  const [priceUpper, priceLower] = useMemo(() => {
    if (!currency0 || !currency1 || !poolInfo) {
      return [undefined, undefined]
    }
    const [upper, lower] = [
      TickUtils.getTickPrice({
        poolInfo,
        tick: tickUpper,
        baseIn,
      }),
      TickUtils.getTickPrice({
        poolInfo,
        tick: tickLower,
        baseIn,
      }),
    ]

    return [
      Price.fromDecimal(currency0, currency1, new BigNumber(upper.price.toString()).toFixed()),
      Price.fromDecimal(currency0, currency1, new BigNumber(lower.price.toString()).toFixed()),
    ]
  }, [poolInfo, tickUpper, tickLower, currency0, currency1, baseIn, tickAtLimit])

  const priceUpperDiffPercent = useMemo(() => {
    if (!priceUpper || !currentPrice || currentPrice.equalTo(0)) {
      return undefined
    }
    const upperAtLimit = baseIn ? tickAtLimit[Bound.UPPER] : tickAtLimit[Bound.LOWER]
    if (upperAtLimit) {
      return new Percent(1, 1)
    }
    const diff = priceUpper.subtract(currentPrice).divide(currentPrice)
    return new Percent(diff.numerator, diff.denominator)
  }, [priceUpper, currentPrice, tickAtLimit, baseIn])

  const priceLowerDiffPercent = useMemo(() => {
    if (!priceLower || !currentPrice) {
      return undefined
    }
    const diff = priceLower.subtract(currentPrice).divide(currentPrice)
    return new Percent(diff.numerator, diff.denominator)
  }, [priceLower, currentPrice])

  return {
    currentPrice,
    priceUpper,
    priceLower,
    priceUpperDiffPercent,
    priceLowerDiffPercent,
  }
}
