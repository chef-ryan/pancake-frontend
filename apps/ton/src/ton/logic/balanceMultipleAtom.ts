import { Currency } from '@pancakeswap/ton-v2-sdk'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { balanceAtom } from './balanceAtom'

export const balanceMultipleAtom = atomFamily((tokens?: Currency[] | null) => {
  return atom((get) => (tokens ? tokens.map((token) => get(balanceAtom(token))).map((balance) => balance.data) : []))
}, isEqual)
