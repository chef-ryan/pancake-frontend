import { chains } from 'utils/wagmi'
import { createConnector } from 'wagmi'
import { EIP6963Detail } from './WalletProvider'

const cache = new Map<string, any>()
export const createEip6963Connector = (detail: EIP6963Detail) => {
  if (cache.has(detail.info.uuid)) {
    return cache.get(detail.info.uuid)
  }

  const { provider, info } = detail

  const connector = createConnector(() => ({
    id: 'injected',
    name: 'Injected',
    type: 'injected',

    async connect({ chainId } = {}) {
      const accounts = await provider.request({ method: 'eth_requestAccounts' })
      const currentChainId = await provider.request({ method: 'eth_chainId' })
      return {
        accounts: accounts as readonly `0x${string}`[],
        chainId: chainId ?? parseInt(currentChainId, 16),
      }
    },

    async disconnect() {},

    async getProvider() {
      return provider
    },

    async isAuthorized() {
      if (!provider) return false
      const accounts = await provider.request({ method: 'eth_accounts' })
      return accounts.length > 0
    },

    async getAccounts() {
      if (!provider) return []
      const accounts = await provider.request({ method: 'eth_accounts' })
      return accounts as readonly `0x${string}`[]
    },

    async getChainId() {
      if (!provider) throw new Error('MetaMask not found')
      const chainId = await provider.request({ method: 'eth_chainId' })
      return parseInt(chainId, 16)
    },

    onAccountsChanged(accounts) {},

    onChainChanged() {},

    onDisconnect(callback) {
      // @ts-ignore
      const handler = (err?: unknown) => callback(err)
      provider?.on?.('disconnect', handler)
    },

    async switchChain({ chainId }) {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      })

      const chain = chains.find((x) => x.id === chainId)!
      return chain
    },
  }))
  cache.set(info.uuid, connector)
  return connector
}
