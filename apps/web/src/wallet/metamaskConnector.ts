import { createConnector } from 'wagmi'
import { eip6963Providers } from './WalletProvider'

export const customMetaMaskConnector = createConnector(() => ({
  id: 'metaMask',
  name: 'metaMask',
  type: 'metaMask',

  async connect({ chainId } = {}) {
    const provider = eip6963Providers.find((p) => p.isMetaMask && !p.isPhantom)
    if (!provider) throw new Error('MetaMask not found')

    const accounts = await provider.request({ method: 'eth_requestAccounts' })
    const currentChainId = await provider.request({ method: 'eth_chainId' })

    return {
      accounts: accounts as readonly `0x${string}`[],
      chainId: chainId ?? parseInt(currentChainId, 16),
    }
  },

  async disconnect() {
    // MetaMask injected connectors typically don't require explicit disconnect logic
  },

  async getProvider() {
    const provider = eip6963Providers.find((p) => p.isMetaMask && !p.isPhantom)
    return provider
  },

  async isAuthorized() {
    const provider = eip6963Providers.find((p) => p.isMetaMask && !p.isPhantom)
    if (!provider) return false
    const accounts = await provider.request({ method: 'eth_accounts' })
    return accounts.length > 0
  },

  async getAccounts() {
    const provider = eip6963Providers.find((p) => p.isMetaMask && !p.isPhantom)
    if (!provider) return []
    const accounts = await provider.request({ method: 'eth_accounts' })
    return accounts as readonly `0x${string}`[]
  },

  async getChainId() {
    const provider = eip6963Providers.find((p) => p.isMetaMask && !p.isPhantom)
    if (!provider) throw new Error('MetaMask not found')
    const chainId = await provider.request({ method: 'eth_chainId' })
    return parseInt(chainId, 16)
  },

  onAccountsChanged(callback) {
    const provider = eip6963Providers.find((p) => p.isMetaMask && !p.isPhantom)
    provider?.on('accountsChanged', callback)
  },

  onChainChanged(callback) {},

  onDisconnect(callback) {
    const provider = eip6963Providers.find((p) => p.isMetaMask && !p.isPhantom)
    provider?.on('disconnect', callback)
  },
}))
