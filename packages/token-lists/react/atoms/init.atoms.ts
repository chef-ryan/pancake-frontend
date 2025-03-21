import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { tokenListUrlsAtom } from './list.atoms'

/**
 * initialize indicator
 */
export const tokenListInitializedAtom = atomFamily((_: string) => {
  return atom(false)
})

/**
 * init token list
 */
export const initTokenListsAtom = atom(null, (_, set, listName: string, listMap: Record<string, string[]>) => {
  const keys = Object.keys(listMap)
  for (const chainId of keys) {
    set(tokenListUrlsAtom({ chainId, listName }), listMap[chainId])
  }
  set(tokenListInitializedAtom(listName), true)
})
