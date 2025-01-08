import { TOKEN_LIST_URLS } from 'config/constants/lists'
import { atomWithQuery } from 'jotai-tanstack-query'
import { networkAtom } from 'ton/atom/networkAtom'
import { TonNetworks } from 'ton/ton.enums'
import { TokenList } from 'utils/tokens/types'

export const fetchListAtom = atomWithQuery<TokenList>((get) => {
  const activeNetwork = get(networkAtom) || TonNetworks.Testnet
  const listUrl = TOKEN_LIST_URLS[activeNetwork]

  return {
    queryKey: ['fetchList', activeNetwork],
    queryFn: async () => {
      const response = await fetch(listUrl)
      return response.json()
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
  }
})
