import { useQueryState, parseAsString } from 'nuqs'
import { atom, useAtomValue } from 'jotai'
import { Field } from 'types'
import { Currency, Native } from '@pancakeswap/ton-v2-sdk'
import { useCurrency } from 'hooks/tokens/useCurrency'
import { networkAtom } from 'ton/atom/networkAtom'
import { useMemo } from 'react'
import { fetchListAtom } from 'atoms/lists/fetchListAtom'

// TODO: Refactor to use the global CurrencyField enum
export const independentFieldAtom = atom(Field.INPUT)

export const typedValueAtom = atom('')

export const useCurrencyQueryState = (key: string, defaultAddress: string = '') => {
  const [address, setAddress] = useQueryState(
    key,
    parseAsString.withDefault(defaultAddress).withOptions({
      shallow: true,
    }),
  )
  const currency = useCurrency(address)

  return [
    currency,
    (c?: Currency) => {
      setAddress(c ? (c.isNative ? c.symbol : c.wrapped.address) : null)
    },
  ] as const
}
export const useInputCurrencyQueryState = () => {
  const network = useAtomValue(networkAtom)
  return useCurrencyQueryState('inputCurrency', Native.onNetwork(network).symbol)
}

export const useOutputCurrencyQueryState = () => {
  const { data: activeList } = useAtomValue(fetchListAtom)
  const cakeAddress = useMemo(() => activeList?.find((item) => item.symbol === 'CAKE')?.address ?? '', [activeList])
  return useCurrencyQueryState('outputCurrency', cakeAddress)
}
