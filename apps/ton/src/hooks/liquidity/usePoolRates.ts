import { Currency } from '@pancakeswap/ton-v2-sdk'
import BN from 'bignumber.js'
import { useMemo } from 'react'
import { formatBalance } from 'ton/utils/formatting'

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

    const formattedReserve0 = formatBalance(reserve0, currency0.decimals).toString()
    const formattedReserve1 = formatBalance(reserve1, currency1.decimals).toString()

    const rateCurrency0 = BN(formattedReserve1).div(BN(formattedReserve0))
    const rateCurrency1 = BN(formattedReserve0).div(BN(formattedReserve1))

    rates.currency0 = rateCurrency0.toString()
    rates.currency1 = rateCurrency1.toString()

    return rates
  }, [currency0, currency1, reserve0, reserve1])
}
