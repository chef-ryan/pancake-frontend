import { atom } from 'jotai'
import { tonStateAtom } from './tonStateAtom'

export const networkAtom = atom((get) => {
  return get(tonStateAtom).network
})
