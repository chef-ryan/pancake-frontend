import { Currency, CurrencyAmount } from '@pancakeswap/ton-v2-sdk'
import { DEFAULT_SIGNIFICANT_DIGITS } from 'config/constants/exchange'
import { useMemo } from 'react'

interface UsePoolRatesProps {
  currency0?: Currency
  currency1?: Currency
  reserve0?: bigint
  reserve1?: bigint
}

export const usePoolRates = ({ currency0, currency1, reserve0, reserve1 }: UsePoolRatesProps) => {
  return useMemo(() => {
    const rates = {
      currency0: '-',
      currency1: '-',
    }

    if (!currency0 || !currency1 || !reserve0 || !reserve1) return rates

    const poolReserve0 = CurrencyAmount.fromRawAmount(currency0, reserve0)
    const poolReserve1 = CurrencyAmount.fromRawAmount(currency1, reserve1)

    rates.currency0 = !poolReserve0.equalTo(0)
      ? poolReserve1.divide(poolReserve0).toSignificant(DEFAULT_SIGNIFICANT_DIGITS)
      : '0'
    rates.currency1 = !poolReserve1.equalTo(0)
      ? poolReserve0.divide(poolReserve1).toSignificant(DEFAULT_SIGNIFICANT_DIGITS)
      : '0'

    return rates
  }, [currency0, currency1, reserve0, reserve1])
}
