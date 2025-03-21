/* eslint-disable no-param-reassign */
import { ChainId } from '@pancakeswap/chains'
import { Currency, ERC20Token, getTokenComparator, NativeCurrency, Token } from '@pancakeswap/sdk'
import { type Address, zeroAddress } from 'viem'

import { createFilterToken, TokenAddressMap, TokenInfo } from '@pancakeswap/token-lists'
import { allActiveTokensAtom, userTokensAtom, useTokenListName } from '@pancakeswap/token-lists/react'
import { useReadContracts } from '@pancakeswap/wagmi'
import { GELATO_NATIVE } from 'config/constants'
import { UnsafeCurrency } from 'config/constants/types'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import {
  combinedCurrenciesMapFromActiveUrlsAtom,
  useUnsupportedTokenList,
  useWarningTokenList,
} from 'state/lists/hooks'
import { useTokenBalances } from 'state/wallet/hooks'
import { safeGetAddress } from 'utils'
import { erc20Abi, isAddress } from 'viem'
import { useAccount } from 'wagmi'
import { useActiveChainId } from './useActiveChainId'
import useNativeCurrency from './useNativeCurrency'

const mapWithoutUrls = (tokenMap?: TokenAddressMap<ChainId>, chainId?: number) => {
  if (!tokenMap || !chainId) return {}
  return Object.keys(tokenMap[chainId] || {}).reduce<{ [address: string]: ERC20Token }>((newMap, address) => {
    const checksumAddress = safeGetAddress(address)

    if (checksumAddress && !newMap[checksumAddress]) {
      newMap[checksumAddress] = tokenMap[chainId][address].token
    }

    return newMap
  }, {})
}

const mapWithoutUrlsBySymbol = (tokenMap?: TokenAddressMap<ChainId>, chainId?: number) => {
  if (!tokenMap || !chainId) return {}
  return Object.keys(tokenMap[chainId] || {}).reduce<{ [symbol: string]: ERC20Token }>((newMap, symbol) => {
    newMap[symbol] = tokenMap[chainId][symbol].token

    return newMap
  }, {})
}

function toToken(token: TokenInfo): Token | null {
  const safeAddr = safeGetAddress(token.address)
  if (!safeAddr) {
    return null
  }

  const erc20 = new ERC20Token(
    token.chainId,
    safeAddr,
    token.decimals,
    token.symbol,
    token.name,
    undefined,
    token.logoURI,
  )

  return erc20
}

interface TokenFilterOptions {
  chainId?: number
  filter?: {
    query: string
    limit?: number
  }
}

export function useSortTokens(tokens: Token[], invert: boolean): Token[] {
  const { address: account } = useAccount()
  const balances = useTokenBalances(account ?? undefined, tokens)
  const comparator = useMemo(() => {
    return getTokenComparator(balances ?? {})
  }, [balances])

  const sorted = useMemo(() => {
    if (invert) {
      tokens.sort((a, b) => comparator(b, a))
    } else {
      tokens.sort(comparator)
    }
    return tokens
  }, [tokens, comparator, invert])
  return sorted
}

export function useAllTokens(options?: TokenFilterOptions): Token[] {
  const { chainId: activeChainId } = useActiveChainId()
  const { chainId, filter } = options || {
    chainId: undefined,
  }
  const tokenList = useTokenListName()
  const tokenInfos = useAtomValue(
    allActiveTokensAtom({
      listName: tokenList,
      chainId: (chainId || activeChainId).toString(),
    }),
  )
  const tokens = useMemo(() => {
    return (tokenInfos || []).map(toToken).filter((x) => x) as Token[]
  }, [tokenInfos])

  const filtered = useMemo(() => {
    let list = tokens
    if (filter) {
      const { query } = filter
      const filterToken = createFilterToken(query, (address) => isAddress(address))
      list = list.filter(filterToken)
      list = getSortedTokensByQuery(list, query)
      if (filter.limit) {
        list = list.slice(0, filter.limit)
      }
    }
    return list
  }, [tokens, filter?.query])

  return filtered
}

const getSortedTokensByQuery = (tokens: Token[] | undefined, searchQuery: string): Token[] => {
  if (!tokens) {
    return []
  }

  const trimmedSearchQuery = searchQuery.toLowerCase().trim()

  const symbolMatch = trimmedSearchQuery.split(/\s+/).filter((s) => s.length > 0)

  if (symbolMatch.length > 1) {
    return tokens
  }

  const exactMatches: Token[] = []
  const symbolSubstrings: Token[] = []
  const rest: Token[] = []

  tokens.forEach((token) => {
    const tokenSymbol = token.symbol?.toLowerCase()
    const tokenName = token.name?.toLowerCase()

    if (tokenSymbol === symbolMatch[0] || tokenName === trimmedSearchQuery) {
      exactMatches.push(token)
    } else if (tokenSymbol?.startsWith(trimmedSearchQuery)) {
      symbolSubstrings.push(token)
    } else {
      rest.push(token)
    }
  })

  return [...exactMatches, ...symbolSubstrings, ...rest]
}

export type TokenChainAddressMap<TChainId extends number = number> = {
  [chainId in TChainId]: {
    [tokenAddress: Address]: ERC20Token
  }
}

export function useOfficialsAndUserAddedTokensByChainIds(chainIds: number[]): TokenChainAddressMap {
  // const tokenMap = useAtomValue(combinedTokenMapFromOfficialsUrlsAtom)
  // return useTokensByChainIds(chainIds, tokenMap)
  return {}
}

export function useAllOnRampTokens(): { [address: string]: Currency } {
  const { chainId } = useActiveChainId()
  const tokenMap = useAtomValue(combinedCurrenciesMapFromActiveUrlsAtom)
  return useMemo(() => {
    return mapWithoutUrlsBySymbol(tokenMap, chainId)
  }, [tokenMap, chainId])
}

/**
 * Returns all tokens that are from officials token list and user added tokens
 */
export function useOfficialsAndUserAddedTokens(): { [address: string]: ERC20Token } {
  const { chainId } = useActiveChainId()
  // const tokenMap = useAtomValue(combinedTokenMapFromOfficialsUrlsAtom)
  const tokenMap = {}

  const userAddedTokens = useAtomValue(userTokensAtom(useTokenListName()))
  return useMemo(() => {
    return (
      userAddedTokens
        // reduce into all ALL_TOKENS filtered by the current chain
        .reduce<{ [address: string]: ERC20Token }>(
          (tokenMap_, token) => {
            const checksumAddress = safeGetAddress(token.address)

            if (checksumAddress) {
              tokenMap_[checksumAddress] = token
            }

            return tokenMap_
          },
          // must make a copy because reduce modifies the map, and we do not
          // want to make a copy in every iteration
          mapWithoutUrls(tokenMap, chainId),
        )
    )
  }, [userAddedTokens, tokenMap, chainId])
}

export function useUnsupportedTokens(): { [address: string]: ERC20Token } {
  const { chainId } = useActiveChainId()
  const unsupportedTokensMap = useUnsupportedTokenList()
  return useMemo(() => mapWithoutUrls(unsupportedTokensMap, chainId), [unsupportedTokensMap, chainId])
}

export function useWarningTokens(): { [address: string]: ERC20Token } {
  const warningTokensMap = useWarningTokenList()
  const { chainId } = useActiveChainId()
  return useMemo(() => mapWithoutUrls(warningTokensMap, chainId), [warningTokensMap, chainId])
}

export function useIsTokenActive(token: ERC20Token | undefined | null): boolean {
  const activeTokens = useAllTokens()

  if (!activeTokens || !token) {
    return false
  }

  const tokenAddress = safeGetAddress(token.address)

  return Boolean(tokenAddress && !!activeTokens[tokenAddress])
}

export function useToken(tokenAddress?: string): ERC20Token | undefined | null {
  const { chainId } = useActiveChainId()
  return useTokenByChainId(tokenAddress, chainId)
}
// undefined if invalid or does not exist
// null if loading
// otherwise returns the token
export function useTokenByChainId(tokenAddress?: string, chainId?: number): ERC20Token | undefined | null {
  const unsupportedTokens = useUnsupportedTokens()
  const tokens = useAllTokens({
    chainId,
  })

  const address = safeGetAddress(tokenAddress)

  const token: ERC20Token | undefined = address && chainId ? (tokens[address] as ERC20Token) : undefined

  const { data, isLoading } = useReadContracts({
    allowFailure: false,
    contracts: [
      {
        chainId,
        address,
        abi: erc20Abi,
        functionName: 'decimals',
      },
      {
        chainId,
        address,
        abi: erc20Abi,
        functionName: 'symbol',
      },
      {
        chainId,
        address,
        abi: erc20Abi,
        functionName: 'name',
      },
    ],
    query: {
      enabled: Boolean(!token && address),
      staleTime: Infinity,
    },
  })

  return useMemo(() => {
    if (token) return token
    if (!chainId || !address) return undefined
    if (unsupportedTokens[address]) return undefined
    if (isLoading) return null
    if (data) {
      return new ERC20Token(chainId, address, data[0], data[1] ?? 'UNKNOWN', data[2] ?? 'Unknown Token')
    }
    return undefined
  }, [token, chainId, address, isLoading, data, unsupportedTokens])
}

export function useOnRampToken(currencyId?: string): Currency | undefined {
  const { chainId } = useActiveChainId()
  const tokens = useAllOnRampTokens()
  const token = currencyId && tokens[currencyId]

  return useMemo(() => {
    if (token) return token
    if (!chainId || !currencyId) return undefined
    return undefined
  }, [token, chainId, currencyId])
}

export function useCurrency(currencyId: string | undefined): UnsafeCurrency {
  const native: NativeCurrency = useNativeCurrency()
  const isNative =
    currencyId?.toUpperCase() === native.symbol?.toUpperCase() ||
    currencyId?.toLowerCase() === GELATO_NATIVE ||
    currencyId?.toLowerCase() === zeroAddress

  const token = useToken(isNative ? undefined : currencyId)
  return isNative ? native : token
}

export function useOnRampCurrency(currencyId: string | undefined): NativeCurrency | Currency | null | undefined {
  const native: NativeCurrency = useNativeCurrency()
  const isNative =
    currencyId?.toUpperCase() === native.symbol?.toUpperCase() ||
    currencyId?.toLowerCase() === GELATO_NATIVE ||
    currencyId?.toLowerCase() === zeroAddress
  const token = useOnRampToken(currencyId)

  return isNative ? native : token
}
