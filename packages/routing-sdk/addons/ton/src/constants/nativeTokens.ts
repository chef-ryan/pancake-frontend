import { AgnosticToken } from './AgnosticToken'
import { TonChainId } from './chains'

export const WNATIVE = {
  [TonChainId.MAINNET]: new AgnosticToken(
    TonChainId.MAINNET,
    'EQBPAVa6fjMigxsnHF33UQ3auufVrg2Z8lBZTY9R-isfjIFr',
    9,
    'Wrapped TON',
    'WTON',
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ton/info/logo.png',
  ),
  [TonChainId.TESTNET]: new AgnosticToken(
    TonChainId.TESTNET,
    'EQBPAVa6fjMigxsnHF33UQ3auufVrg2Z8lBZTY9R-isfjIFr',
    9,
    'Wrapped TON',
    'WTON',
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ton/info/logo.png',
  ),
}

export const NATIVE = {
  [TonChainId.MAINNET]: {
    chainId: TonChainId.MAINNET,
    decimals: 9,
    symbol: 'TON',
    name: 'TON',
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ton/info/logo.png',
  },
  [TonChainId.TESTNET]: {
    chainId: TonChainId.TESTNET,
    decimals: 9,
    symbol: 'TON',
    name: 'TON',
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ton/info/logo.png',
  },
}
