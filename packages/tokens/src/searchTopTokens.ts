import { ChainId } from '@pancakeswap/chains'
import { UnifiedToken } from '@pancakeswap/sdk'
import { bscTokens } from './constants/bsc'

export const searchTopTokens: Record<ChainId, UnifiedToken[]> = {
  [ChainId.GOERLI]: [],
  [ChainId.BSC]: [bscTokens.u],
  [ChainId.BSC_TESTNET]: [],
  [ChainId.ETHEREUM]: [],
  [ChainId.ARBITRUM_ONE]: [],
  [ChainId.ZKSYNC]: [],
  [ChainId.ZKSYNC_TESTNET]: [],
  [ChainId.LINEA_TESTNET]: [],
  [ChainId.LINEA]: [],
  [ChainId.ARBITRUM_GOERLI]: [],
  [ChainId.OPBNB]: [],
  [ChainId.OPBNB_TESTNET]: [],
  [ChainId.BASE]: [],
  [ChainId.BASE_TESTNET]: [],
  [ChainId.SCROLL_SEPOLIA]: [],
  [ChainId.SEPOLIA]: [],
  [ChainId.ARBITRUM_SEPOLIA]: [],
  [ChainId.BASE_SEPOLIA]: [],
  [ChainId.MONAD_MAINNET]: [],
  [ChainId.MONAD_TESTNET]: [],
}
