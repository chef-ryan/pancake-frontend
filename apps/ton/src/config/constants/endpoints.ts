import { TonNetworks } from 'ton/ton.enums'

export const ASSET_CDN = 'https://assets.pancakeswap.finance'

// Block Explorer for TON Blockchain
export const blockExplorerUrls = {
  [TonNetworks.Mainnet]: 'https://tonscan.org',
  [TonNetworks.Testnet]: 'https://testnet.tonscan.org',
}

export const TON_API = {
  [TonNetworks.Mainnet]: 'https://tonapi.io',
  [TonNetworks.Testnet]: 'https://testnet.tonapi.io',
}

export const bridgeLink = 'https://bridge.pancakeswap.finance'

// Learn More Links to Docs
export const liquidityLearnMoreUrl = 'https://docs.pancakeswap.finance'
