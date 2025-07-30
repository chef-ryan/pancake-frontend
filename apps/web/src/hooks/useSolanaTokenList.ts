import { useEffect, useMemo, useState, useCallback } from 'react'

import { useAtomValue, useSetAtom } from 'jotai'
import { solanaTokenListAtom, solanaListSettingsAtom } from 'state/token/solanaTokenAtoms'

import type { TokenInfo } from '@pancakeswap/solana-core-sdk'
import type { SPLToken } from '@pancakeswap/swap-sdk-core'

import { useQuery } from '@tanstack/react-query'
import { SOLANA_LISTS_CONFIG, TokenListKey, USER_ADDED_KEY, convertRawTokenInfoIntoSPLToken } from 'config/solana-list'

// Custom hook for individual token list queries
function useTokenListQuery(listKey: TokenListKey) {
  const listSettings = useAtomValue(solanaListSettingsAtom)
  // PancakeSwap list is always enabled
  const isEnabled = listKey === TokenListKey.PANCAKESWAP ? true : listSettings[listKey]
  const listConfig = SOLANA_LISTS_CONFIG[listKey]

  return useQuery({
    queryKey: ['solana-token-list', listConfig.key, isEnabled],
    queryFn: async () => {
      const res = await fetch(listConfig.apiUrl)
      if (!res.ok) {
        throw new Error(`${listConfig.name} list fetch failed`)
      }

      return res.json()
    },
    retry: 3,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: isEnabled,
    select: (data) => {
      return listConfig.parser(data)
    },
  })
}

function getUserAddedTokens(): TokenInfo[] {
  try {
    return JSON.parse(localStorage.getItem(USER_ADDED_KEY) || '[]')
  } catch {
    return []
  }
}

function saveUserAddedTokens(tokens: TokenInfo[]) {
  localStorage.setItem(USER_ADDED_KEY, JSON.stringify(tokens))
}

export function useSolanaTokenList() {
  const [userTokens, setUserTokens] = useState<TokenInfo[]>(getUserAddedTokens())
  const setTokenList = useSetAtom(solanaTokenListAtom)

  // Create individual queries for each token list using the custom hook
  const { data: pcsTokens, isLoading: pcsLoading } = useTokenListQuery(TokenListKey.PANCAKESWAP)
  const { data: raydiumTokens, isLoading: raydiumLoading } = useTokenListQuery(TokenListKey.RAYDIUM)
  const { data: jupiterTokens, isLoading: jupiterLoading } = useTokenListQuery(TokenListKey.JUPITER)

  const mergedTokens = useMemo(() => {
    const seen = new Set<string>()
    const result: SPLToken[] = []

    const addTokens = (tokens: SPLToken[] | undefined) => {
      if (!tokens) return
      for (const token of tokens) {
        if (!seen.has(token.address)) {
          seen.add(token.address)
          result.push(token)
        }
      }
    }

    // Process in priority order
    addTokens(pcsTokens)
    addTokens(userTokens.map(convertRawTokenInfoIntoSPLToken))
    addTokens(raydiumTokens)
    addTokens(jupiterTokens)

    return result
  }, [pcsTokens, raydiumTokens, jupiterTokens, userTokens])

  useEffect(() => {
    setTokenList(mergedTokens)
  }, [mergedTokens, setTokenList])

  // Loading state: true if any enabled query is still loading

  // Add a user token and persist
  const addUserToken = useCallback((token: TokenInfo) => {
    setUserTokens((prev) => {
      const next = prev.some((t) => t.address === token.address) ? prev : [...prev, token]
      saveUserAddedTokens(next)
      return next
    })
  }, [])

  // Remove a user token and persist
  const removeUserToken = useCallback((address: string) => {
    setUserTokens((prev) => {
      const next = prev.filter((t) => t.address !== address)
      saveUserAddedTokens(next)
      return next
    })
  }, [])

  const tokenCountsByList = useMemo(() => {
    return {
      [TokenListKey.PANCAKESWAP]: pcsTokens?.length ?? 0,
      [TokenListKey.RAYDIUM]: raydiumTokens?.length ?? 0,
      [TokenListKey.JUPITER]: jupiterTokens?.length ?? 0,
    }
  }, [pcsTokens?.length, raydiumTokens?.length, jupiterTokens?.length])

  return useMemo(
    () => ({
      tokenList: mergedTokens,
      loading: pcsLoading || raydiumLoading || jupiterLoading,
      addUserToken,
      removeUserToken,
      tokenCountsByList,
    }),
    [mergedTokens, pcsLoading, raydiumLoading, jupiterLoading, addUserToken, removeUserToken, tokenCountsByList],
  )
}
