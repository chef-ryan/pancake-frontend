import { FarmV4SupportedChainId, Protocol } from '@pancakeswap/farms'

const HEX_ADDRESS_REG = /^0x[a-fA-F0-9]{40,64}$/
const SOL_ADDRESS_REG = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/

const isAddressKeyword = (keyword: string) => HEX_ADDRESS_REG.test(keyword) || SOL_ADDRESS_REG.test(keyword)

export interface ExtendSearchParam {
  protocols: Protocol[]
  chains: FarmV4SupportedChainId[]
  tokens?: string[]
  symbols?: string[]
}

function parseTokenExtendSearch(
  keywords: string,
  protocols: Protocol[],
  chains: FarmV4SupportedChainId[],
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
    },
  ].filter((x) => x.symbols && x.symbols.length > 0)
}

const parseFarmSearchAddress = (
  keywords: string,
  protocols: Protocol[],
  chains: FarmV4SupportedChainId[],
): ExtendSearchParam[] => {
  const trimmedKeyword = keywords.trim()
  if (isAddressKeyword(trimmedKeyword)) {
    return [
      {
        protocols,
        tokens: chains.map((chain) => `${chain}:${trimmedKeyword}`),
        chains,
      },
    ].filter((x) => x.tokens && x.tokens.length > 0)
  }
  return []
}

const parseQueryChain = (chains: FarmV4SupportedChainId[], protocols: Protocol[]): ExtendSearchParam[] => {
  if (chains.length === 0) {
    return []
  }
  return [
    {
      protocols,
      chains,
    },
  ]
}

export const parseExtendSearchParams = (keywords: string, protocols: Protocol[], chains: FarmV4SupportedChainId[]) => {
  if (!keywords || keywords.trim().length === 0) {
    return []
  }

  const addressParams = parseFarmSearchAddress(keywords, protocols, chains)
  const tokenParams = parseTokenExtendSearch(keywords, protocols, chains)
  const chainParams = parseQueryChain(chains, protocols)

  return [...chainParams, ...addressParams, ...tokenParams]
}
