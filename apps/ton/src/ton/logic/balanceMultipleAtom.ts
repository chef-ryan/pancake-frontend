import { Currency } from '@pancakeswap/routing-sdk-addon-ton'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { balanceAtom } from './balanceAtom'

export const balanceMultipleAtom = atomFamily((tokens?: Currency[] | null) =>
  atom((get) => (tokens ? tokens.map((token) => get(balanceAtom(token))).map((balance) => balance.data) : [])),
)
