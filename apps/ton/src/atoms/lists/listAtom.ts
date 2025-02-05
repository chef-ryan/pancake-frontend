import { atom } from 'jotai'
import { atomFamily, atomWithStorage } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { networkAtom } from 'ton/atom/networkAtom'
import { TonNetworks } from 'ton/ton.enums'
import { TokenList } from 'utils/tokens/types'

export const listAtom = atomFamily((chain: TonNetworks) => atomWithStorage<TokenList[]>(chain, []), isEqual)
export const activeListAtom = atom((get) => get(listAtom(get(networkAtom))))

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
