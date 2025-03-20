import { Token } from '@pancakeswap/swap-sdk-core'
import { atom } from 'jotai'
import { atomFamily, loadable, unwrap } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { TokenList } from '../src/types'
import { IndexedDBStorage } from './IndexDBStorage'

interface TokenListParams {
  listName: string
  chainId: string
  listUrl: string
}

interface TokenListForChainParams {
  listName: string
  chainId: string
}

function keyOf(params: TokenListParams) {
  return `${params.chainId}-${params.listUrl}`
}

export const tokenListUrlsAtom = atomFamily((_: TokenListForChainParams) => {
  return atom<string[]>([])
}, isEqual)

export const storageAtom = atomFamily((listName: string) => {
  return atom(() => {
    const storage = IndexedDBStorage(`tokens`, listName)
    return storage
  })
})

const refreshUserTokenAtom = atom(0)
export const userTokensAtom = atomFamily((params: TokenListForChainParams) => {
  const key = `user-tokens-${params.chainId}`
  return atom(
    async (get) => {
      get(refreshUserTokenAtom)
      const storage = get(storageAtom(params.listName))
      const tokens = await storage.getItem<Token[]>(key, null)
      return tokens || []
    },
    async (get, set, token: Token) => {
      const tokens = await get(userTokensAtom(params))
      tokens.push(token)
      const storage = get(storageAtom(params.listName))
      await storage.setItem(`user-tokens-${params.chainId}`, tokens)
      set(refreshUserTokenAtom, (c) => c + 1)
    },
  )
}, isEqual)

/**
 * Remove all user tokens
 */
export const removeAllUserTokensAtom = atom(null, async (get, set, listName: string, chainId: string) => {
  const storage = get(storageAtom(listName))
  await storage.setItem(`user-tokens-${chainId}`, [])
  set(refreshUserTokenAtom, (c) => c + 1)
})

export const addUserTokenAtom = atom(null, async (get, set, listName: string, chainId: string, token: Token) => {
  const tokens = await get(userTokensAtom({ listName: 'user', chainId }))
  tokens.push(token)
  const storage = get(storageAtom(listName))
  await storage.setItem(`user-tokens-${chainId}`, tokens)
  set(refreshUserTokenAtom, (c) => c + 1)
})

export const tokenListInitializedAtom = atomFamily((_: string) => {
  return atom(false)
})

export const initTokenListsAtom = atom(null, (_, set, listName: string, listMap: Record<string, string[]>) => {
  const keys = Object.keys(listMap)
  for (const chainId of keys) {
    set(tokenListUrlsAtom({ chainId, listName }), listMap[chainId])
  }
  set(tokenListInitializedAtom(listName), true)
})

export const activeTokenListUrlsAtom = atomFamily((params: TokenListForChainParams) => {
  return atom<string[]>((get) => {
    const lists = get(tokenListUrlsAtom(params))
    return lists
  })
})

export const inactiveTokenListUrlsAtom = atomFamily((_: TokenListForChainParams) => atom<string[]>([]), isEqual)

export const tokenListAtom = atomFamily((params: TokenListParams) => {
  const { listUrl, listName } = params
  const key = keyOf(params)
  return atom(async (get) => {
    const storage = get(storageAtom(listName))
    const cached = await storage.getItem(key, null)
    if (!cached) {
      const getTokenList = (await import('./getTokenList')).default
      const list: TokenList = await getTokenList(listUrl)
      storage.setItem(key, list)
      return list
    }
    return cached
  })
}, isEqual)

export const allActiveTokensAtom = atomFamily((params: TokenListForChainParams) => {
  const { listName, chainId } = params
  return unwrap(
    atom(
      async (get) => {
        const activeListUrls = get(
          activeTokenListUrlsAtom({
            listName,
            chainId,
          }),
        )

        const lists = await Promise.all(
          activeListUrls.map(async (url) => {
            const tokenList = await get(tokenListAtom({ listName, listUrl: url, chainId }))
            return tokenList
          }),
        )
        const tokens = lists.flatMap((list) => list.tokens).filter((token) => `${token.chainId}` === chainId)
        return tokens
      },
      (prev) => prev || [],
    ),
  )
}, isEqual)

export const tokenListLoadingAtom = atomFamily((params: TokenListParams) => {
  return loadable(tokenListAtom(params))
})
