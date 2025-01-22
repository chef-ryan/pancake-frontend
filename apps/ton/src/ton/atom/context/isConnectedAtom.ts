import { atom } from 'jotai'
import { addressAtom } from './addressAtom'

export const isConnectedAtom = atom((get) => {
  return Boolean(get(addressAtom))
})
