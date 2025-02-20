import { NATIVE, TonChainId } from '@pancakeswap/ton-v2-sdk'

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
    logoURL: NATIVE[TonChainId.Mainnet].logoURI,
    chainId: TonChainId.Mainnet,
    url: '#',
  },
  {
    name: 'Binance Smart Chain',
    symbol: 'BSC',
    logoURL: 'https://assets.pcswap.org/web/chains/56.png',
    chainId: 56,
    url: 'https://pancakeswap.finance',
    isExternal: true,
  },
]
