import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'

import { SPLToken } from '@pancakeswap/swap-sdk-core'

// Atom to store the list of SPLToken
export const solanaTokenListAtom = atom<SPLToken[]>([])

// AtomFamily to get a token by address from the list
export const solanaTokenAtomFamily = atomFamily((address?: string) =>
  atom((get) => (address ? get(solanaTokenListAtom).find((token) => token.address === address) : undefined)),
)
