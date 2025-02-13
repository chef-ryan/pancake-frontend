import { currencyFamily } from 'atoms/currencyAtoms'
import { atom } from 'jotai'
import { CurrencyField } from 'types/currency'

export const liquidityIndependentFieldAtom = atom(CurrencyField.ADD_LIQUIDITY_CURRENCY0)

export const currency0Atom = atom((get) => get(currencyFamily(CurrencyField.ADD_LIQUIDITY_CURRENCY0)))
export const currency1Atom = atom((get) => get(currencyFamily(CurrencyField.ADD_LIQUIDITY_CURRENCY1)))

export const currency0Value = atom('')
export const currency1Value = atom('')
