import { Token } from './currency/Token'
import { TonChainId } from './ton.enums'

// TODO: Update Wrapped tokens to pTON or other verified token
export const WNATIVE = {
  [TonChainId.Mainnet]: new Token(
    TonChainId.Mainnet,
    'EQBnGWMCf3-FZZq1W4IWcWiGAc3PHuZ0_H-7sad2oY00o83S',
    9,
    'Proxy TON',
    'pTON',
    'https://static.ston.fi/logo/ton_symbol.png',
  ),
  [TonChainId.Testnet]: new Token(
    TonChainId.Testnet,
    'kQCM3B12QK1e4yZSf8GtBRT0aLMNyEsBc_DhVfRRtOEffAw5',
    9,
    'Proxy TON',
    'pTON',
    'https://static.ston.fi/logo/ton_symbol.png',
  ),
}

export const NATIVE = {
  [TonChainId.Mainnet]: {
    chainId: TonChainId.Mainnet,
    decimals: 9,
    symbol: 'TON',
    name: 'TON',
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ton/info/logo.png',
  },
  [TonChainId.Testnet]: {
    chainId: TonChainId.Testnet,
    decimals: 9,
    symbol: 'TON',
    name: 'TON',
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ton/info/logo.png',
  },
}
