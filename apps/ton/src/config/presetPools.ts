import { TonChainId } from '@pancakeswap/ton-v2-sdk'
import testnetPools from 'public/lists/pools_-3.json'

export const PRESET_POOLS: {
  [chainId in TonChainId]: {
    [tokenPair: string]: {
      token0: string
      token1: string
      poolAddress: string
    }
  }
} = {
  [TonChainId.Mainnet]: {},
  [TonChainId.Testnet]: testnetPools,
}
