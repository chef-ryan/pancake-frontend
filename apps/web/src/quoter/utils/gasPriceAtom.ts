import { ChainId } from '@pancakeswap/chains'
import { CHAINS } from 'config/chains'
import { PUBLIC_NODES } from 'config/nodes'
import { atomFamily } from 'jotai/utils'
import { atomWithAsyncRetry } from 'utils/atomWithAsyncRetry'
import { fallbackWithRank } from 'utils/fallbackWithRank'
import { publicClient } from 'utils/viem'
import { createPublicClient, http, PublicClient } from 'viem'

// TODO: Using Tenderly Virtual Network for IFO v10 testing
const BSC_CUSTOM_NODE = 'https://virtual.binance.eu.rpc.tenderly.co/08d597ab-f1d8-43bf-9fbf-6ba2fb94f081'
// const BSC_CUSTOM_NODE = 'https://bsc-dataseed.bnbchain.org'

const gasPriceClients: Record<ChainId, PublicClient> = CHAINS.reduce((clients, chain) => {
  const transport =
    chain.id === ChainId.BSC
      ? http(BSC_CUSTOM_NODE, { timeout: 15_000 })
      : fallbackWithRank(PUBLIC_NODES[chain.id].map((url) => http(url, { timeout: 15_000 })))

  // eslint-disable-next-line no-param-reassign
  clients[chain.id] = createPublicClient({
    chain,
    transport,
  })

  return clients
}, {} as Record<ChainId, PublicClient>)

export const gasPriceWeiAtom = atomFamily((chainId?: ChainId) => {
  return atomWithAsyncRetry({
    asyncFn: async () => {
      if (!chainId) {
        return undefined
      }
      return gasPriceClients[chainId].getGasPrice()
    },
    fallbackValue: () => {
      const client = publicClient({ chainId })
      return client.getGasPrice()
    },
  })
})
