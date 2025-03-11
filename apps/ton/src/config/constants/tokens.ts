import tokenList from 'public/lists/testnet.json'
import { Token, TonChainId } from '@pancakeswap/ton-v2-sdk'

// Common tokens
export const PRESET_TOKENS = {
  CAKE: {
    [TonChainId.Mainnet]: new Token(
      TonChainId.Mainnet,
      'kQA8oT-HRBY-9-yFymg17hD5FE07--Z1gYc_sZTbzqpOZr1t', // TODO: Add CAKE mainnet address
      9,
      'CAKE',
      'Pancake Token',
      'https://tokens.pancakeswap.finance/images/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82.png',
    ),
    [TonChainId.Testnet]: new Token(
      TonChainId.Testnet,
      'kQA8oT-HRBY-9-yFymg17hD5FE07--Z1gYc_sZTbzqpOZr1t',
      9,
      'CAKE',
      'Pancake Token',
      'https://tokens.pancakeswap.finance/images/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82.png',
    ),
  },
  CAKE2: {
    [TonChainId.Mainnet]: new Token(
      TonChainId.Mainnet,
      'kQAaZeQEAnKF7BKNIzgMIFdvRfBNZnbZUICo7ZkNPaRsjMLr', // TODO: Remove CAKE2
      9,
      'CAKE2',
      'Pancake Token 2',
      'https://tokens.pancakeswap.finance/images/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82.png',
    ),
    [TonChainId.Testnet]: new Token(
      TonChainId.Testnet,
      'kQAaZeQEAnKF7BKNIzgMIFdvRfBNZnbZUICo7ZkNPaRsjMLr',
      9,
      'CAKE2',
      'Pancake Token 2',
      'https://tokens.pancakeswap.finance/images/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82.png',
    ),
  },
}

// we have USDC pair on testnet, so used USDC instead of USDT on testnet
const USDC = tokenList.tokens.find((t) => t.symbol === 'USDC')!

export const USDT = {
  [TonChainId.Mainnet]: new Token(
    TonChainId.Mainnet,
    'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs',
    6,
    'USD₮',
    'Tether USD',
  ),
  [TonChainId.Testnet]: new Token(TonChainId.Testnet, USDC.address, USDC.decimals, USDC.symbol, USDC.name),
}

export const J_USDT = {
  [TonChainId.Mainnet]: new Token(
    TonChainId.Mainnet,
    'EQBynBO23ywHy_CgarY9NK9FTz0yDsG82PtcbSTQgGoXwiuA',
    6,
    'jUSDT',
    'jUSDT',
  ),
  [TonChainId.Testnet]: new Token(TonChainId.Testnet, USDC.address, USDC.decimals, USDC.symbol, USDC.name),
}
