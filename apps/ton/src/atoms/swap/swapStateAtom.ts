import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { Field } from 'types'

// const initialState: SwapState = {
//   independentField: Field.INPUT,
//   typedValue: '',
//   [Field.INPUT]: {
//     currencyId: '',
//   },
//   [Field.OUTPUT]: {
//     currencyId: '',
//   },
//   pairDataById: {},
//   derivedPairDataById: {},
//   recipient: null,
// }

// export const swapStateAtom = atom<SwapState>(initialState)

export const independentFieldAtom = atom(Field.INPUT)
export const typedValueAtom = atom('')
export const currencyIdFamily = atomFamily((field: Field) => atom(''))

const currencyFamily = atomFamily((field: Field) => {
  const id = currencyIdFamily(field)
  // TODO
  // const currency = await mappingIdToCurrency(id)
  // return currency
  return id
})

export const inputCurrencyAtom = atom((get) => {
  const independentField = get(independentFieldAtom)
  return get(currencyFamily(independentField))
})

export const outputCurrencyAtom = atom((get) => {
  const independentField = get(independentFieldAtom)
  return get(currencyFamily(independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT))
})
