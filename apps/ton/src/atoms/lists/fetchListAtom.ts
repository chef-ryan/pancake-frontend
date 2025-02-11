import { Token, TonNetworks } from '@pancakeswap/ton-v2-sdk'
import { TOKEN_LIST_URLS } from 'config/constants/lists'
import { atomWithQuery } from 'jotai-tanstack-query'
import { networkAtom } from 'ton/atom/networkAtom'
import { TokenList } from 'utils/tokens/types'

export const fetchListAtom = atomWithQuery<Token[]>((get) => {
  const activeNetwork = get(networkAtom) || TonNetworks.Testnet
  const listUrl = TOKEN_LIST_URLS[activeNetwork]

  return {
    queryKey: ['fetchList', activeNetwork],
    queryFn: async () => {
      const response = await fetch(listUrl)
      const data: TokenList = await response.json()

      return data.tokens.map(
        (tokenData) =>
          new Token(
            tokenData.chainId,
            tokenData.address,
            tokenData.decimals,
            tokenData.symbol,
            tokenData.name,
            tokenData.logoURI,
          ),
      )
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  }
})
