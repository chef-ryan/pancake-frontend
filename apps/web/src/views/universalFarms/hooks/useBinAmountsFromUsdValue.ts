import { CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import BN from 'bignumber.js'
import { useMemo } from 'react'

export const useBinAmountsFromUsdValue = ({ usdValue, currency0, currency1, currency0UsdPrice, currency1UsdPrice }) => {
  const usdAmount = parseFloat(usdValue) / 2

  const amount0 = useMemo(() => {
    const amount = new BN(usdAmount).times(10 ** currency0.decimals).div(currency0UsdPrice)
    const [n, d] = amount.toFraction()
    return CurrencyAmount.fromFractionalAmount(currency0, n.toString(), d.toString())
  }, [usdAmount, currency0, currency0UsdPrice])

  const amount1 = useMemo(() => {
    const amount = new BN(usdAmount).times(10 ** currency1.decimals).div(currency1UsdPrice)
    const [n, d] = amount.toFraction()
    return CurrencyAmount.fromFractionalAmount(currency1, n.toString(), d.toString())
  }, [usdAmount, currency1, currency1UsdPrice])

  return [amount0, amount1]
}
