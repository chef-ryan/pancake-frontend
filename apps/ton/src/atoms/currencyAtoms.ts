import { Currency } from '@pancakeswap/ton-v2-sdk'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'

export const currencyFamily = atomFamily((field: string) => atom(undefined as Currency | undefined))
export const setCurrencyAtom = atom(null, (_, set, field: string, currency: Currency | undefined) => {
  set(currencyFamily(field), currency)
})
