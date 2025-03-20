import { TonChainId, TonNetworks } from '@pancakeswap/ton-v2-sdk'

export const TG_BOT_URL = 'https://tgqa.noahlabs.tech/ton'

export const ASSET_CDN = 'https://assets.pancakeswap.finance'

export const API_BASE_URL = `/${process.env.NEXT_PUBLIC_GLOBAL_PREFIX}/api`
export const PUBLIC_BASE_URL = `/${process.env.NEXT_PUBLIC_GLOBAL_PREFIX}`

// Block Explorer for TON Blockchain
export const blockExplorerUrls = {
  [TonNetworks.Mainnet]: 'https://tonscan.org',
  [TonNetworks.Testnet]: 'https://testnet.tonscan.org',
}

export const TON_API = {
  [TonChainId.Mainnet]: 'https://tonapi.io',
  [TonChainId.Testnet]: 'https://testnet.tonapi.io',
}

export const bridgeLink = 'https://bridge.ton.org'

// Learn More Links to Docs
export const liquidityLearnMoreUrl = 'https://docs.pancakeswap.finance'
