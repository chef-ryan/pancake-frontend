import { chains } from 'utils/wagmi'
import { createConnector } from 'wagmi'
import { EIP6963Detail } from './WalletProvider'

const cache = new Map<string, any>()
let isSwitching = false
const listeners: Array<() => void> = []
export const createEip6963Connector = (detail: EIP6963Detail) => {
  if (cache.has(detail.info.uuid)) {
    return cache.get(detail.info.uuid)
  }

  const { provider, info } = detail

  const connector = createConnector(() => ({
    id: info.uuid,
    name: info.name,
    type: 'injected',

    async connect({ chainId } = {}) {
      const accounts = await provider.request({ method: 'eth_requestAccounts' })
      const currentChainId = await provider.request({ method: 'eth_chainId' })
      return {
        accounts: accounts as readonly `0x${string}`[],
        chainId: chainId ?? parseInt(currentChainId, 16),
      }
    },

    async disconnect() {
      listeners.forEach((off) => off())
      listeners.length = 0
    },

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

    onAccountsChanged(callback) {
      const handler = (accounts?: string[]) => {
        if (Array.isArray(accounts)) {
          if (accounts.length === 0 && isSwitching) {
            return
          }
          // @ts-ignore
          callback(accounts as readonly `0x${string}`[])
        }
      }
      provider?.on?.('accountsChanged', handler)
      listeners.push(() => provider?.removeListener?.('accountsChanged', handler))
    },

    onChainChanged(callback) {
      const handler = (next: string | number) => {
        const id = typeof next === 'string' ? parseInt(next, 16) : Number(next)
        // @ts-ignore
        callback(id)
      }
      provider?.on?.('chainChanged', handler)
      listeners.push(() => provider?.removeListener?.('chainChanged', handler))
    },

    onDisconnect(callback) {
      // @ts-ignore
      const handler = (err?: unknown) => callback(err)
      provider?.on?.('disconnect', handler)
      listeners.push(() => provider?.removeListener?.('disconnect', handler))
    },

    async switchChain({ chainId }) {
      isSwitching = true
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${chainId.toString(16)}` }],
        })
      } finally {
        // allow wallet time to re-emit correct accounts after switch
        setTimeout(() => {
          isSwitching = false
        }, 300)
      }
      const chain = chains.find((x) => x.id === chainId)!
      return chain
    },
  }))
  cache.set(info.uuid, connector)
  return connector
}
