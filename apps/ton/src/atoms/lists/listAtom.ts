import { atom } from 'jotai'
import { atomFamily, atomWithStorage } from 'jotai/utils'
import { TonNetworks } from 'ton/ton.enums'
import { TokenList } from 'utils/tokens/types'

export const listAtom = atomFamily((chain: TonNetworks) => atomWithStorage<TokenList[]>(chain, []))

export const setListAtom = atom(null, (_, set, chain: TonNetworks, lists: TokenList[]) => {
  set(listAtom(chain), lists)
})

// TODO: Use it when fetching using fetchListAtom, if no caching yet
export const addListAtom = atom(null, (_, set, chain: TonNetworks, list: TokenList) => {
  set(listAtom(chain), (prev) => [...prev, list])
})

export const removeListAtom = atom(null, (_, set, chain: TonNetworks, list: TokenList) => {
  set(listAtom(chain), (prev) => prev.filter((l) => l.name !== list.name))
})
