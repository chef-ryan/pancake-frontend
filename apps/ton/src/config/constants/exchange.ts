import { ONE_HUNDRED_PERCENT, Percent } from '@pancakeswap/sdk'
import { Currency, NATIVE, Native, Token, TonChainId } from '@pancakeswap/ton-v2-sdk'
import tokenList from 'public/lists/testnet.json'

export const BIG_INT_ZERO = 0n

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

// Query Configuration
export const QUERY_DEFAULT_STALE_TIME = 1000 * 60 // 1 minute
export const QUERY_MEDIUM_STALE_TIME = 1000 * 60 * 5 // 5 minutes
export const QUERY_RETRY_DELAY = 1500 // 1.5 seconds

export const DEFAULT_SIGNIFICANT_DIGITS = 5
export const MAXIMUM_SIGNIFICANT_DIGITS = 9

// Liquidity removed when creating new pools, defined in smart contract
export const REQUIRED_MIN_LIQUIDITY = 1000

export const BETTER_TRADE_LESS_HOPS_THRESHOLD = new Percent(50n, BIPS_BASE)

// max hops for swap
export const MAX_HOPS = 3

export const ADDITIONAL_BASES: { [chainId: number]: { [tokenAddress: string]: Token[] } } = {}

export const CUSTOM_BASES: { [chainId: number]: { [tokenAddress: string]: Token[] } } = {}
// todo:@eric mock bases to test multihops
const USDC = tokenList.tokens.find((t) => t.symbol === 'USDC')!
export const BASES_TO_CHECK_TRADES_AGAINST: { [chainId: number]: Currency[] } = {
  [TonChainId.Testnet]: [
    new Native(NATIVE[TonChainId.Testnet]),
    new Token(USDC.chainId, USDC.address, USDC.decimals, USDC.name, USDC.symbol, USDC.logoURI),
  ] satisfies Currency[],
  [TonChainId.Mainnet]: [],
}

export const TOTAL_FEE = 0.0025
export const LP_HOLDERS_FEE = 0.0017
export const TREASURY_FEE = 0.000225
export const BUYBACK_FEE = 0.000575
export const BASE_FEE = new Percent(25n, BIPS_BASE)
export const INPUT_FRACTION_AFTER_FEE = ONE_HUNDRED_PERCENT.subtract(BASE_FEE)
