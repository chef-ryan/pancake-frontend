import { Currency } from '@pancakeswap/ton-v2-sdk'
import { useQuery } from '@tanstack/react-query'
import BN from 'bignumber.js'
import { formatBalance } from 'ton/utils/formatting'
import { getCurrencyOrder } from 'ton/utils/tokenOrder'
import { stringify } from 'utils'

interface UsePoolRatesProps {
  currency0?: Currency
  currency1?: Currency
  reserve0?: bigint
  reserve1?: bigint
}

export const usePoolRates = ({ currency0, currency1, reserve0, reserve1 }: UsePoolRatesProps) => {
  const { data } = useQuery({
    queryKey: ['usePoolRates', currency0, currency1, stringify(reserve0), stringify(reserve1)],
    queryFn: async () => {
      const rates = {
        currency0: '',
        currency1: '',
      }

      if (!currency0 || !currency1 || !reserve0 || !reserve1) return rates

      const {
        currency0: currency0Sorted,
        currency1: currency1Sorted,
        isFlipped,
      } = await getCurrencyOrder(currency0, currency1)

      const formattedReserve0 = formatBalance(reserve0, currency0Sorted.decimals).toString()
      const formattedReserve1 = formatBalance(reserve1, currency1Sorted.decimals).toString()

      const rateCurrency0 = BN(formattedReserve1).div(BN(formattedReserve0))
      const rateCurrency1 = BN(formattedReserve0).div(BN(formattedReserve1))

      if (isFlipped) {
        rates.currency0 = rateCurrency1.toString()
        rates.currency1 = rateCurrency0.toString()
      } else {
        rates.currency0 = rateCurrency0.toString()
        rates.currency1 = rateCurrency1.toString()
      }

      return rates
    },
    initialData: {
      currency0: '',
      currency1: '',
    },
  })
  return data
}
