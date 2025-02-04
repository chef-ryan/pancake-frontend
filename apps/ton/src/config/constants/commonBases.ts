import { Token } from '@pancakeswap/ton-v2-sdk'
import { TonChainId } from 'ton/ton.enums'

export const SUGGESTED_BASES: { [chainId in TonChainId]: Token[] } = {
  [TonChainId.Mainnet]: [],
  [TonChainId.Testnet]: [
    new Token(
      TonChainId.Mainnet,
      'kQA8oT-HRBY-9-yFymg17hD5FE07--Z1gYc_sZTbzqpOZr1t',
      9,
      'CAKE',
      'Pancake Token',
      'https://tokens.pancakeswap.finance/images/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82.png',
    ),
  ],
}
