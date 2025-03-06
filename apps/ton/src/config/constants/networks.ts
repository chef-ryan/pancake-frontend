import { TonChainId } from '@pancakeswap/ton-v2-sdk'
import { getAssetUrl } from 'utils'
import { TG_BOT_URL } from './endpoints'

export const AVAILABLE_NETWORKS: {
  name: string
  symbol: string
  logoURL: string
  chainId: number
  url: string
  isExternal?: boolean
}[] = [
  {
    name: 'TON Network',
    symbol: 'TON',
    logoURL: getAssetUrl('ton-logo.png'),
    chainId: TonChainId.Mainnet,
    url: '#',
  },
  {
    name: 'Binance Smart Chain',
    symbol: 'BSC',
    logoURL: 'https://assets.pcswap.org/web/chains/56.png',
    chainId: 56,
    url:
      typeof window !== 'undefined' && window.location.href.includes(TG_BOT_URL)
        ? '/tg-swap'
        : 'https://pancakeswap.finance',
    isExternal: typeof window !== 'undefined' && window.location.href.includes(TG_BOT_URL),
  },
]
