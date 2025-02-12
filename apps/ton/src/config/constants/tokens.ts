import { Token, TonChainId, TonNetworks } from '@pancakeswap/ton-v2-sdk'

// Common tokens
export const PRESET_TOKENS = {
  CAKE: {
    [TonNetworks.Mainnet]: new Token(
      TonChainId.Mainnet,
      'kQA8oT-HRBY-9-yFymg17hD5FE07--Z1gYc_sZTbzqpOZr1t', // TODO: Add CAKE mainnet address
      9,
      'CAKE',
      'Pancake Token',
      'https://tokens.pancakeswap.finance/images/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82.png',
    ),
    [TonNetworks.Testnet]: new Token(
      TonChainId.Testnet,
      'kQA8oT-HRBY-9-yFymg17hD5FE07--Z1gYc_sZTbzqpOZr1t',
      9,
      'CAKE',
      'Pancake Token',
      'https://tokens.pancakeswap.finance/images/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82.png',
    ),
  },
  CAKE2: {
    [TonNetworks.Mainnet]: new Token(
      TonChainId.Mainnet,
      'kQAaZeQEAnKF7BKNIzgMIFdvRfBNZnbZUICo7ZkNPaRsjMLr', // TODO: Remove CAKE2
      9,
      'CAKE2',
      'Pancake Token 2',
      'https://tokens.pancakeswap.finance/images/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82.png',
    ),
    [TonNetworks.Testnet]: new Token(
      TonChainId.Testnet,
      'kQAaZeQEAnKF7BKNIzgMIFdvRfBNZnbZUICo7ZkNPaRsjMLr',
      9,
      'CAKE2',
      'Pancake Token 2',
      'https://tokens.pancakeswap.finance/images/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82.png',
    ),
  },
}
