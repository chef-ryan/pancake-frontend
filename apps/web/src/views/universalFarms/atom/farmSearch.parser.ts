import { FarmV4SupportedChainId, Protocol } from '@pancakeswap/farms'
import { FarmQuery } from 'state/farmsV4/search/edgeFarmQueries'

const HEX_ADDRESS_REG = /^0x[a-fA-F0-9]{40,64}$/
const SOL_ADDRESS_REG = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/

const isAddressKeyword = (keyword: string) => HEX_ADDRESS_REG.test(keyword) || SOL_ADDRESS_REG.test(keyword)

export interface ExtendSearchParam {
  protocols: Protocol[]
  chains: FarmV4SupportedChainId[]
  tokens?: string[]
  symbols?: string[]
  sortBy?: FarmQuery['sortBy']
}

function parseTokenExtendSearch(
  keywords: string,
  protocols: Protocol[],
  chains: FarmV4SupportedChainId[],
  sortBy: FarmQuery['sortBy'],
): ExtendSearchParam[] {
  const symbols = keywords
    .trim()
    .split(/(\s+|,|-|\/)/)
    .map((x) => x.trim())
    .filter((x) => x && !isAddressKeyword(x))
    .slice(0, 3)

  return [
    {
      protocols,
      chains,
      symbols,
      sortBy,
    },
  ].filter((x) => x.symbols && x.symbols.length > 0)
}

const parseFarmSearchAddress = (
  keywords: string,
  protocols: Protocol[],
  chains: FarmV4SupportedChainId[],
  sortBy: FarmQuery['sortBy'],
): ExtendSearchParam[] => {
  const trimmedKeyword = keywords.trim()
  if (isAddressKeyword(trimmedKeyword)) {
    return [
      {
        protocols,
        tokens: chains.map((chain) => `${chain}:${trimmedKeyword}`),
        chains,
        sortBy,
      },
    ].filter((x) => x.tokens && x.tokens.length > 0)
  }
  return []
}

const parseQueryChain = (
  chains: FarmV4SupportedChainId[],
  protocols: Protocol[],
  sortBy: FarmQuery['sortBy'],
): ExtendSearchParam[] => {
  if (chains.length === 0) {
    return []
  }
  return [
    {
      protocols,
      chains,
      sortBy,
    },
  ]
}

export const parseExtendSearchParams = (
  keywords: string,
  protocols: Protocol[],
  chains: FarmV4SupportedChainId[],
  sortBy: FarmQuery['sortBy'],
) => {
  if (!keywords || keywords.trim().length === 0) {
    return []
  }

  const addressParams = parseFarmSearchAddress(keywords, protocols, chains, sortBy)
  const tokenParams = parseTokenExtendSearch(keywords, protocols, chains, sortBy)
  const chainParams = parseQueryChain(chains, protocols, sortBy)

  return [...chainParams, ...addressParams, ...tokenParams]
}
