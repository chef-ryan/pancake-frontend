import maxBy from 'lodash/maxBy'
import _uniqBy from 'lodash/uniqBy'
import { Currency, Pair, Price, priceOf } from '@pancakeswap/ton-v2-sdk'
import { involvesToken } from './tokens/involvesToken'
import { getReserveOfToken } from './tokens/getReserveOfToken'

export const getCurrencyPrice = (
  currency: Currency | undefined | null,
  defaultStable: Currency,
  wnative: Currency,
  stableTokens: Currency[],
  nativePairInfo: Pair | null | undefined,
  stableNativePairInfo: Pair | null | undefined,
  stablePairsInfo: (Pair | null)[],
): Price<Currency, Currency> | undefined => {
  if (!currency || !currency.wrapped || !defaultStable || !wnative || !stableTokens.filter(Boolean).length) {
    return undefined
  }

  const bestStablePair = maxBy(
    _uniqBy(
      stablePairsInfo.filter(
        (stablePair) => stablePair && stablePair.reserve0.greaterThan('0') && stablePair.reserve1.greaterThan('0'),
      ),
      (pair) => pair?.poolAddress.toString(),
    ),
    (stablePair) => {
      const stablePairToken = stableTokens.find((stableToken) => stablePair && involvesToken(stableToken, stablePair))
      const stablePairTokenAmount =
        stablePairToken && stablePair ? getReserveOfToken(stablePairToken, stablePair).quotient.toString() : null
      if (stablePairToken && stablePairTokenAmount) {
        return parseInt(stablePairTokenAmount)
      }
      return 0
    },
  )

  // handle native
  if (currency.wrapped.equals(wnative)) {
    if (bestStablePair) {
      const price = priceOf(wnative, bestStablePair.reserve0, bestStablePair.reserve1)
      const stablePairToken = stableTokens.find((stableToken) => involvesToken(stableToken, bestStablePair))
      if (stablePairToken) return new Price(currency, stablePairToken, price.denominator, price.numerator)
    }
    return undefined
  }
  // handle stable
  if (currency.wrapped.equals(defaultStable)) {
    return new Price(defaultStable, defaultStable, '1', '1')
  }

  const isNativePairExist =
    nativePairInfo && nativePairInfo.reserve0.greaterThan('0') && nativePairInfo.reserve1.greaterThan('0')
  const isStableNativePairExist =
    stableNativePairInfo &&
    stableNativePairInfo.reserve0.greaterThan('0') &&
    stableNativePairInfo.reserve1.greaterThan('0')

  const nativePairNativeAmount = isNativePairExist && getReserveOfToken(wnative, nativePairInfo)
  const nativePairNativeStableValue: bigint =
    nativePairNativeAmount && bestStablePair && isStableNativePairExist
      ? priceOf(wnative, stableNativePairInfo.reserve0, stableNativePairInfo.reserve1).quote(nativePairNativeAmount)
          .quotient
      : 0n

  // all other tokens
  // first try the stable pair
  if (bestStablePair) {
    const stablePairToken = stableTokens.find((stableToken) => involvesToken(stableToken, bestStablePair))
    if (
      stablePairToken &&
      getReserveOfToken(stablePairToken, bestStablePair).greaterThan(nativePairNativeStableValue)
    ) {
      const price = priceOf(currency.wrapped, bestStablePair.reserve0, bestStablePair.reserve1)
      return new Price(currency, stablePairToken, price.denominator, price.numerator)
    }
  }
  if (isNativePairExist && isStableNativePairExist) {
    if (
      getReserveOfToken(defaultStable, stableNativePairInfo).greaterThan('0') &&
      getReserveOfToken(wnative, nativePairInfo).greaterThan('0')
    ) {
      const nativeStablePrice = priceOf(defaultStable, stableNativePairInfo.reserve0, stableNativePairInfo.reserve1)
      const currencyNativePrice = priceOf(wnative, nativePairInfo.reserve0, nativePairInfo.reserve1)
      const stablePrice = nativeStablePrice.multiply(currencyNativePrice).invert()
      return new Price(currency, defaultStable, stablePrice.denominator, stablePrice.numerator)
    }
  }
  return undefined
}
