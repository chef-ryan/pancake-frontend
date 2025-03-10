import { Currency } from '@pancakeswap/ton-v2-sdk'
import { useQuery } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'
import { chainIdAtom } from 'ton/atom/chainIdAtom'
import { getCurrencyOrder } from 'ton/utils/tokenOrder'

interface UseCurrencyOrderProps {
  currency0_?: Currency
  currency1_?: Currency
}

export const useCurrencyOrder = ({ currency0_, currency1_ }: UseCurrencyOrderProps) => {
  const chainId = useAtomValue(chainIdAtom)
  const {
    data: { currency0, currency1, isFlipped },
  } = useQuery({
    queryKey: ['currency-order', chainId, currency0_, currency1_],
    queryFn: async () =>
      currency0_ && currency1_
        ? getCurrencyOrder(currency0_, currency1_)
        : { currency0: currency0_, currency1: currency1_, isFlipped: false },
    initialData: { currency0: currency0_, currency1: currency1_, isFlipped: false },
  })

  return { currency0, currency1, isFlipped }
}
