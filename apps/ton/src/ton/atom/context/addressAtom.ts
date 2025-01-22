import { atom } from 'jotai'
import { tonStateAtom } from './tonStateAtom'

export const setAddressAtom = atom(null, (_, set, address: string) => {
  set(tonStateAtom, (prev) => {
    return { ...prev, address }
  })
})

export const addressAtom = atom((get) => {
  return get(tonStateAtom).address
})
