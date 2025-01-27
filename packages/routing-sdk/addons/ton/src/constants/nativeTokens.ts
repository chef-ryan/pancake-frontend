import { Token } from './Token'
import { TonChainId } from './chains'

export const WNATIVE = {
  [TonChainId.Mainnet]: new Token(
    TonChainId.Mainnet,
    'EQBPAVa6fjMigxsnHF33UQ3auufVrg2Z8lBZTY9R-isfjIFr',
    9,
    'Wrapped TON',
    'WTON',
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ton/info/logo.png',
  ),
  [TonChainId.Testnet]: new Token(
    TonChainId.Testnet,
    'EQBPAVa6fjMigxsnHF33UQ3auufVrg2Z8lBZTY9R-isfjIFr',
    9,
    'Wrapped TON',
    'WTON',
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ton/info/logo.png',
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
