import { Percent } from '@pancakeswap/sdk'
import { TonChainId, Token, Native, NATIVE, Currency } from '@pancakeswap/ton-v2-sdk'

export const BIG_INT_ZERO = 0n
export const BIG_INT_TEN = 10n
export const BIG_INT_20 = 20n

export const MIN_BNB: bigint = BIG_INT_TEN ** 15n // .001 BNB

// one basis point
export const BIPS_BASE = 10000n
export const ONE_BIPS = new Percent(1n, BIPS_BASE)

// used for warning states
export const ALLOWED_PRICE_IMPACT_LOW: Percent = new Percent(100n, BIPS_BASE) // 1%
export const ALLOWED_PRICE_IMPACT_MEDIUM: Percent = new Percent(300n, BIPS_BASE) // 3%
export const ALLOWED_PRICE_IMPACT_HIGH: Percent = new Percent(500n, BIPS_BASE) // 5%
// if the price slippage exceeds this number, force the user to type 'confirm' to execute
export const PRICE_IMPACT_WITHOUT_FEE_CONFIRM_MIN: Percent = new Percent(1000n, BIPS_BASE) // 10%
// for non expert mode disable swaps above this
export const BLOCKED_PRICE_IMPACT_NON_EXPERT: Percent = new Percent(1500n, BIPS_BASE) // 15%

// Query Stale Times
export const QUERY_DEFAULT_STALE_TIME = 1000 * 60 // 1 minute
export const QUERY_MEDIUM_STALE_TIME = 1000 * 60 * 5 // 5 minutes

export const DEFAULT_SIGNIFICANT_DIGITS = 5

export const BETTER_TRADE_LESS_HOPS_THRESHOLD = new Percent(50n, BIPS_BASE)

// max hops for swap
export const MAX_HOPS = 3

export const ADDITIONAL_BASES: { [chainId in TonChainId]?: { [tokenAddress: string]: Token[] } } = {}

export const CUSTOM_BASES: { [chainId in TonChainId]?: { [tokenAddress: string]: Token[] } } = {}

export const BASES_TO_CHECK_TRADES_AGAINST: { [chainId: number]: Currency[] } = {
  [TonChainId.Testnet]: [
    new Native(NATIVE[TonChainId.Testnet]),
    new Token(
      TonChainId.Testnet,
      'kQCHLgAWLrFnHChbETKLnUEpA_oW0_5f9SDVYc9mJtVDMXrC',
      9,
      'USDT',
      'USDT',
      'https://cache.tonapi.io/imgproxy/JHJ0sotb2B_DU6JIHdIMKEz_5wmkeY4EboeQLPlpUBY/rs:fill:200:200:1/g:no/aHR0cHM6Ly90b25hcGktaW1nLWNhY2hlLmZyYTEuZGlnaXRhbG9jZWFuc3BhY2VzLmNvbS9jYThiNTk1Mzc3Nzg0OGNkNzE4YzYzZDE5OTQzZDEyOWFjOTI5OGJjYTdjZTFhZGNjMDBiMTVlYWU4M2U4NjhlLnBuZw.webp',
    ),
  ] satisfies Currency[],
  [TonChainId.Mainnet]: [],
}
