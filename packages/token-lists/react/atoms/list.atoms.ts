import { atom } from 'jotai'
import { atomFamily, loadable, unwrap } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { TokenList } from '../../dist'
import { getTokenList } from '../getTokenList'
import { IndexedDBStorage } from '../IndexDBStorage'
import { userUrlsAtom } from './manage.atoms'
import { TokenListForChainParams, TokenListParams } from './types'

function keyOf(params: TokenListParams) {
  return `${params.chainId}-${params.listUrl}`
}

export const tokenListUrlsAtom = atomFamily((_: TokenListForChainParams) => {
  return atom<string[]>([])
}, isEqual)

/**
 * Active urls
 */
export const activeTokenListUrlsAtom = atomFamily((params: TokenListForChainParams) => {
  return atom<string[]>((get) => {
    const lists = get(tokenListUrlsAtom(params))
    return lists
  })
})

/**
 * Token list atoms
 */
export const allActiveTokensAtom = atomFamily((params: TokenListForChainParams) => {
  const { listName, chainId } = params
  return unwrap(
    atom(
      async (get) => {
        console.log('allActiveTokensAtom', listName, chainId)
        const activeListUrls = get(
          activeTokenListUrlsAtom({
            listName,
            chainId,
          }),
        )
        console.log('activeListUrls', activeListUrls)
        const userUrls = await get(userUrlsAtom(listName))
        const urls = [...activeListUrls, ...userUrls]

        const lists = await Promise.all(
          urls.map(async (url) => {
            const tokenList = await get(tokenListAtom({ listName, listUrl: url, chainId }))
            return tokenList
          }),
        )
        console.log(lists)
        const tokens = lists
          .filter((x): x is TokenList => x !== null)
          .flatMap((list) => list.tokens)
          .filter((token) => `${token.chainId}` === chainId)
        console.log({ tokens })
        return tokens
      },
      (prev) => prev || [],
    ),
  )
}, isEqual)

export const inactiveTokenListUrlsAtom = atomFamily((_: TokenListForChainParams) => atom<string[]>([]), isEqual)

export const tokenListAtom = atomFamily((params: TokenListParams) => {
  const { listName, listUrl } = params
  const key = keyOf(params)
  const storage = IndexedDBStorage('tokens', listName)
  return atom(async () => {
    const cached = await storage.getItem(key, null)
    if (cached) {
      return cached as TokenList
    }
    const list = await getTokenList(listUrl)
    if (list) {
      await storage.setItem(key, list)
    }
    return list
  })
}, isEqual)

export const tokenListLoadingAtom = atomFamily((params: TokenListParams) => {
  return loadable(tokenListAtom(params))
})
