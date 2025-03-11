import { useMemo } from 'react'
import { Currency, Price, Token, TonChainId } from '@pancakeswap/ton-v2-sdk'
import { getCurrencyPrice } from 'utils/getCurrencyPrice'
import { USDT, J_USDT } from 'config/constants/tokens'

import { useActiveChainId } from './useActiveChainId'
import { useNativeCurrency } from './tokens/useNativeCurrency'
import { usePairs } from './swap/useAllCommonPairs'

export const useStablePrice = (currency?: Currency | null): Price<Currency, Currency> | undefined => {
  const { chainId: chainId_ } = useActiveChainId()
  const chainId: TonChainId = currency?.chainId || chainId_

  const native = useNativeCurrency()
  const wnative = native.wrapped
  const wrapped = currency?.wrapped
  const defaultStable = useMemo(() => USDT[chainId], [chainId])
  const stableTokens = useMemo(() => [USDT[chainId], J_USDT[chainId]], [chainId])

  const {
    data: [stableNativePairInfo, nativePairInfo],
  } = usePairs(
    useMemo(
      () =>
        !wrapped
          ? []
          : wnative?.equals(wrapped)
          ? [[wnative, defaultStable]]
          : [
              [wnative, defaultStable],
              [wrapped, wnative],
            ],
      [wnative, defaultStable, wrapped],
    ),
  )

  const { data: stablePairsInfo } = usePairs(
    useMemo(
      () =>
        stableTokens
          .filter((st): st is Token => Boolean(st && wrapped && !wrapped.equals(st)))
          .map((st) => {
            return [wrapped!, st]
          }),
      [stableTokens, wrapped],
    ),
  )

  return useMemo(
    () =>
      getCurrencyPrice(
        currency,
        defaultStable,
        wnative,
        stableTokens,
        nativePairInfo,
        stableNativePairInfo,
        stablePairsInfo,
      ),
    [currency, defaultStable, nativePairInfo, stableNativePairInfo, stablePairsInfo, stableTokens, wnative],
  )
}
