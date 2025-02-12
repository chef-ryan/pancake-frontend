import { currencyFamily } from 'atoms/currencyAtoms'
import { atom } from 'jotai'
import { Field } from 'types'

// TODO: Refactor to use the global CurrencyField enum
export const independentFieldAtom = atom(Field.INPUT)

export const typedValueAtom = atom('')

export const inputCurrencyAtom = atom((get) => {
  return get(currencyFamily(Field.INPUT))
})

export const outputCurrencyAtom = atom((get) => {
  return get(currencyFamily(Field.OUTPUT))
})
