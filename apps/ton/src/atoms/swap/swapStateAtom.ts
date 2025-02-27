import { useQueryState, parseAsString } from 'nuqs'
import { atom } from 'jotai'
import { Field } from 'types'
import { Currency } from '@pancakeswap/ton-v2-sdk'
import { useCurrency } from 'hooks/tokens/useCurrency'

// TODO: Refactor to use the global CurrencyField enum
export const independentFieldAtom = atom(Field.INPUT)

export const typedValueAtom = atom('')

export const useInputCurrencyQueryState = (defaultAddress: string = '') => {
  const [address, setAddress] = useQueryState(
    'inputCurrency',
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

export const useOutputCurrencyQueryState = (defaultAddress: string = '') => {
  const [address, setAddress] = useQueryState(
    'outputCurrency',
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
