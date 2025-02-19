import { Currency } from '@pancakeswap/ton-v2-sdk'
import BN from 'bignumber.js'
import { useMemo } from 'react'
import { getCurrencyOrder } from 'ton/utils/address'

interface UsePoolRatesProps {
  currency0?: Currency
  currency1?: Currency
  reserve0?: bigint
  reserve1?: bigint
}

export const usePoolRates = ({ currency0, currency1, reserve0, reserve1 }: UsePoolRatesProps) => {
  return useMemo(() => {
    const rates = {
      currency0: '',
      currency1: '',
    }

    if (!currency0 || !currency1 || !reserve0 || !reserve1) return rates

    const { isFlipped } = getCurrencyOrder(currency0, currency1)

    const rateCurrency0 = BN(reserve1.toString()).div(BN(reserve0.toString()))
    const rateCurrency1 = BN(reserve0.toString()).div(BN(reserve1.toString()))

    if (isFlipped) {
      rates.currency0 = rateCurrency1.toString()
      rates.currency1 = rateCurrency0.toString()
      return rates
    }
    rates.currency0 = rateCurrency0.toString()
    rates.currency1 = rateCurrency1.toString()

    return rates
  }, [currency0, currency1, reserve0, reserve1])
}
