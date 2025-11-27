import { ChainId } from '@pancakeswap/chains'
import {
  arbitrum,
  base,
  bsc,
  mainnet as ethereum,
  // linea,
  // opBNB,
  zksync,
} from 'wagmi/chains'

export const SUPPORT_ONLY_BSC = [ChainId.BSC]

export const targetChains = [
  ethereum,
  bsc,
  zksync,
  arbitrum,
  base,
  // linea,
  // opBNB,
]

export const predictionTaskSupportChains = [bsc]

export const SUPPORTED_CHAIN = [
  ChainId.ETHEREUM,
  ChainId.BSC,
  ChainId.ZKSYNC,
  ChainId.ARBITRUM_ONE,
  ChainId.BASE,
  // ChainId.LINEA,
  // ChainId.OPBNB,
]
