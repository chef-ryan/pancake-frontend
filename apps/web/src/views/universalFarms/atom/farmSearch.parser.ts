import { ChainId } from '@pancakeswap/chains'
import { FarmV4SupportedChainId, Protocol, supportedChainIdV4 } from '@pancakeswap/farms'
import { Native, ZERO_ADDRESS } from '@pancakeswap/sdk'

import { TokenInfo } from '@pancakeswap/token-lists'

export interface ExtendSearchParam {
  protocols: Protocol[]
  chains: FarmV4SupportedChainId[]
  tokens?: string[]
}

function parseTokenExtendSearch(
  keywords: string,
  protocols: Protocol[],
  chains: ChainId[],
  symbolsMap: Record<string, TokenInfo[]>,
): ExtendSearchParam[] {
  const prts = keywords
    .trim()
    .split(/(\s+|,|-|\/)/)
    .map((x) => x.trim())
    .filter((x) => x)
    .slice(0, 3)

  // tokens find by user's search
  const candidateTokens = prts
    .map((prt) => symbolsMap[prt.toLowerCase()])
    .filter((x) => x)
    .flat()
    .filter((x) => supportedChainIdV4.includes(x.chainId))
    .map((token) => {
      return {
        address: token.address,
        chainId: token.chainId,
      }
    })

  // extended wrapped tokens
  const extendedWrapTokens = candidateTokens
    .filter((x) => x.address === ZERO_ADDRESS)
    .map((x) => {
      const { wrapped } = Native.onChain(x.chainId)
      return {
        address: wrapped.address,
        chainId: x.chainId,
      }
    })

  // Token for search
  const tokens = [
    ...new Set(
      [...candidateTokens, ...extendedWrapTokens].map((x) => {
        return `${x.chainId}:${x.address}`
      }),
    ),
  ]

  return [
    {
      protocols,
      chains: chains as FarmV4SupportedChainId[],
      tokens,
    },
  ].filter((x) => x.tokens && x.tokens.length > 0)
}

const IS_ADDRESS_REG = /^0x[a-fA-F0-9]{40,64}$/

const parseFarmSearchAddress = (keywords: string, protocols: Protocol[]): ExtendSearchParam[] => {
  if (IS_ADDRESS_REG.test(keywords.trim())) {
    return [
      {
        protocols,
        tokens: supportedChainIdV4.map((chain) => `${chain}:${keywords.trim()}`),
        chains: [...supportedChainIdV4],
      },
    ].filter((x) => x.tokens && x.tokens.length > 0)
  }
  return []
}

const parseQueryChain = (chains: ChainId[], protocols: Protocol[]): ExtendSearchParam[] => {
  if (chains.length === 0) {
    return []
  }
  return [
    {
      protocols,
      chains: chains as FarmV4SupportedChainId[],
    },
  ]
}

export const parseExtendSearchParams = (
  keywords: string,
  protocols: Protocol[],
  chains: ChainId[],
  symbolsMap: Record<string, TokenInfo[]>,
) => {
  if (!keywords || keywords.trim().length === 0) {
    return []
  }

  const addressParams = parseFarmSearchAddress(keywords, protocols)
  const tokenParams = parseTokenExtendSearch(keywords, protocols, chains, symbolsMap)
  const chainParams = parseQueryChain(chains, protocols)

  return [...chainParams, ...addressParams, ...tokenParams]
}
