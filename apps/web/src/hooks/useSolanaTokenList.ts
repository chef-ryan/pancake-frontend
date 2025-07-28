import { useEffect, useMemo, useState } from 'react'

import { useAtomValue, useSetAtom } from 'jotai'
import { solanaTokenListAtom } from 'state/token/solanaTokenAtoms'

import type { TokenInfo } from '@pancakeswap/solana-core-sdk'
import { SPLToken } from '@pancakeswap/swap-sdk-core'
import { useQuery } from '@tanstack/react-query'
import { NonEVMChainId } from '@pancakeswap/chains'
import { TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID } from '@solana/spl-token-0.4'

const PCS_TOKEN_LIST_URL = 'https://tokens.pancakeswap.finance/pancakeswap-solana-default.json'
const RAYDIUM_TOKEN_LIST_URL = 'https://api-v3.raydium.io/mint/list'
const JUPITER_TOKEN_LIST_URL = 'https://lite-api.jup.ag/tokens/v1/tagged/verified'
const USER_ADDED_KEY = 'solana-user-added-tokens'

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
  const tokenList = useAtomValue(solanaTokenListAtom)

  // Fetch PCS token list
  const pcsQuery = useQuery({
    queryKey: ['solana-pcs-list'],
    queryFn: async () => {
      const res = await fetch(PCS_TOKEN_LIST_URL)
      if (!res.ok) throw new Error('PCS list fetch failed')
      const tokens = (await res.json()).tokens as TokenInfo[]
      return tokens ?? []
    },
    retry: 3,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  // Fetch Raydium token list
  const raydiumQuery = useQuery({
    queryKey: ['solana-raydium-list'],
    queryFn: async () => {
      const res = await fetch(RAYDIUM_TOKEN_LIST_URL)
      if (!res.ok) throw new Error('Raydium list fetch failed')
      const { data } = await res.json()
      return {
        tokens: (data.mintList ?? []) as TokenInfo[],
        blacklist: (data.blacklist ?? []) as string[],
        whitelist: (data.whiteList ?? []) as string[],
      }
    },
    retry: 3,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  // Fetch Jupiter token list
  const jupiterQuery = useQuery({
    queryKey: ['solana-jupiter-list'],
    queryFn: async () => {
      const res = await fetch(JUPITER_TOKEN_LIST_URL)
      if (!res.ok) throw new Error('Jupiter list fetch failed')
      const data = await res.json()
      return Array.isArray(data) ? (data as TokenInfo[]) : (data.tokens as TokenInfo[])
    },
    retry: 3,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  // Helper to merge and deduplicate tokens
  const mergedTokens = useMemo(() => {
    const addresses = new Set<string>()
    const tokens: SPLToken[] = []
    const addToken = (token: TokenInfo, blacklist: string[] = []) => {
      if (blacklist.includes(token.address)) return
      if (addresses.has(token.address)) return
      addresses.add(token.address)
      tokens.push(
        new SPLToken({
          ...token,
          chainId: NonEVMChainId.SOLANA,
          programId:
            token.programId ??
            (token.tags?.includes('token-2022') ? TOKEN_2022_PROGRAM_ID.toBase58() : TOKEN_PROGRAM_ID.toBase58()),
        }),
      )
    }
    if (raydiumQuery.data) {
      for (const t of raydiumQuery.data.tokens) addToken(t, raydiumQuery.data.blacklist)
      const solToken = raydiumQuery.data.tokens.find((t) => t.symbol === 'SOL')
      if (solToken) addToken(solToken, raydiumQuery.data.blacklist)
    }
    if (pcsQuery.data) for (const t of pcsQuery.data) addToken(t)
    if (jupiterQuery.data) for (const t of jupiterQuery.data) addToken(t)
    for (const t of userTokens) addToken(t)
    return tokens
  }, [pcsQuery.data, raydiumQuery.data, jupiterQuery.data, userTokens])

  // Store the token list in atom and atom family after fetched
  useEffect(() => {
    setTokenList(mergedTokens)
  }, [mergedTokens, setTokenList])

  // Loading state: true if any query is still loading
  const loading = pcsQuery.isLoading || raydiumQuery.isLoading || jupiterQuery.isLoading

  // Add a user token and persist
  const addUserToken = (token: TokenInfo) => {
    setUserTokens((prev) => {
      const next = prev.some((t) => t.address === token.address) ? prev : [...prev, token]
      saveUserAddedTokens(next)
      return next
    })
  }

  // Remove a user token and persist
  const removeUserToken = (address: string) => {
    setUserTokens((prev) => {
      const next = prev.filter((t) => t.address !== address)
      saveUserAddedTokens(next)
      return next
    })
  }

  return { tokenList, loading, addUserToken, removeUserToken }
}
