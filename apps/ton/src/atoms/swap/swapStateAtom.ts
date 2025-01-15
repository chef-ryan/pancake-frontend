import { currencyFamily } from 'atoms/currencyAtoms'
import { atom } from 'jotai'
import { Field } from 'types'

// TODO: Refactor to use the global CurrencyField enum
export const independentFieldAtom = atom(Field.INPUT)

export const typedValueAtom = atom('')

export const inputCurrencyAtom = atom((get) => {
  const independentField = get(independentFieldAtom)
  return get(currencyFamily(independentField))
})

export const outputCurrencyAtom = atom((get) => {
  const independentField = get(independentFieldAtom)
  return get(currencyFamily(independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT))
})
