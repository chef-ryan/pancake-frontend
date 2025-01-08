import { Currency, Token } from '@pancakeswap/routing-sdk-addon-ton'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { Field } from 'types'

export const independentFieldAtom = atom(Field.INPUT)

export const typedValueAtom = atom('')

export const currencyFamily = atomFamily((field: string) => atom(undefined as Currency | undefined))
export const setCurrencyAtom = atom(null, (_, set, field: string, currency: Currency | undefined) => {
  set(
    currencyFamily(field),
    currency &&
      (currency.isNative
        ? {
            isNative: true,
            isToken: false,
            symbol: 'TON',
            name: 'TON',
            decimals: 9,
            chainId: currency.chainId,
            logoURI: currency.logoURI,
            equals: () => false,
          }
        : new Token(
            currency.chainId,
            currency.address,
            currency.decimals,
            currency.symbol,
            currency.name,
            currency.logoURI,
          )),
  )
})

export const inputCurrencyAtom = atom((get) => {
  const independentField = get(independentFieldAtom)
  return get(currencyFamily(independentField))
})

export const outputCurrencyAtom = atom((get) => {
  const independentField = get(independentFieldAtom)
  return get(currencyFamily(independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT))
})
