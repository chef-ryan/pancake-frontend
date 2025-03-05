import { TonChainId } from '@pancakeswap/ton-v2-sdk'
import { getAssetUrl } from 'utils'

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
    url: '/tg-swap',
  },
]
