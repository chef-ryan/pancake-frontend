import type { Token } from '@pancakeswap/swap-sdk-core'
import { atom } from 'jotai'
import { atomFamily, atomWithStorage } from 'jotai/utils'
import { IndexedDBStorage } from '../IndexDBStorage'

const USER_TOKEN_KEY = 'user-tokens'
const USER_LISTS_KEY = 'user-lists'
/**
 * User tokens
 */
export const userTokensAtom = atomFamily((listName: string) => {
  return atomWithStorage(USER_TOKEN_KEY, [] as Token[], IndexedDBStorage('tokens', listName))
})

/**
 * Add users token
 */
export const addUserTokenAtom = atom(null, async (get, set, listName: string, token: Token) => {
  const tokens = await get(userTokensAtom(listName))
  tokens.push(token)
  await set(userTokensAtom(listName), tokens)
})

type TokenParams = {
  listName: string
  token?: Token
}
export const isUserAddedTokenAtom = atomFamily(
  (params: TokenParams) => {
    return atom(async (get) => {
      if (!params.token) return false
      const tokens = await get(userTokensAtom(params.listName))
      return tokens.some((t) => t.equals(params.token!))
    })
  },
  (a, b) => {
    if (a.listName !== b.listName) return false
    if (a.token && b.token) return a.token.equals(b.token)
    return a.token === b.token
  },
)

/**
 * User urls
 */
export const userUrlsAtom = atomFamily((listName: string) => {
  return atomWithStorage(USER_LISTS_KEY, [] as string[], IndexedDBStorage('tokens', listName))
})

export const enableUserUrlAtom = atom(null, async (get, set, listName: string, url: string) => {
  const urls = await get(userUrlsAtom(listName))
  urls.push(url)
  await set(userUrlsAtom(listName), urls)
})

export const disableUserUrlAtom = atom(null, async (get, set, listName: string, url: string) => {
  const urls = await get(userUrlsAtom(listName))
  const newUrls = urls.filter((u) => u !== url)
  await set(userUrlsAtom(listName), newUrls)
})
