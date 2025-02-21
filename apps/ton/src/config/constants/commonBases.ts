import { Native, Token, TonChainId } from '@pancakeswap/ton-v2-sdk'
import { PRESET_TOKENS } from './tokens'

export const SUGGESTED_BASES: { [chainId in TonChainId]: Token[] } = {
  [TonChainId.Mainnet]: [PRESET_TOKENS.CAKE[TonChainId.Mainnet], PRESET_TOKENS.CAKE2[TonChainId.Mainnet]],
  [TonChainId.Testnet]: [PRESET_TOKENS.CAKE[TonChainId.Testnet], PRESET_TOKENS.CAKE2[TonChainId.Testnet]],
}

export const DEFAULT_ADD_LIQUIDITY_CURRENCIES = {
  [TonChainId.Mainnet]: {
    currency0: Native.onChain(TonChainId.Mainnet).symbol,
    currency1: PRESET_TOKENS.CAKE[TonChainId.Mainnet].address,
  },
  [TonChainId.Testnet]: {
    currency0: Native.onChain(TonChainId.Testnet).symbol,
    currency1: PRESET_TOKENS.CAKE[TonChainId.Testnet].address,
  },
}
