import { Token, TonChainId } from '@pancakeswap/ton-v2-sdk'
import { PRESET_TOKENS } from './tokens'

export const SUGGESTED_BASES: { [chainId in TonChainId]: Token[] } = {
  [TonChainId.Mainnet]: [PRESET_TOKENS.CAKE[TonChainId.Mainnet], PRESET_TOKENS.CAKE2[TonChainId.Mainnet]],
  [TonChainId.Testnet]: [PRESET_TOKENS.CAKE[TonChainId.Testnet], PRESET_TOKENS.CAKE2[TonChainId.Testnet]],
}
