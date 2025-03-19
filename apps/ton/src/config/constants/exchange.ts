import { ONE_HUNDRED_PERCENT, Percent } from '@pancakeswap/sdk'
import { Currency, NATIVE, Native, Token, TonChainId } from '@pancakeswap/ton-v2-sdk'
import BN from 'bignumber.js'
import mainnetTokenList from 'public/lists/main.json'
import testnetTokenList from 'public/lists/testnet.json'
import { POOL_FEE_DECIMALS } from './formatting'

export const BIG_INT_ZERO = 0n
export const ZERO_BN = BN(0)

// one basis point
const BIPS_BASE_DECIMALS = 4
export const BIPS_BASE = 10_000n
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

// Any amount0 or amount1 that is less than this will be refunded in an Add Liquidity transaction
export const MINIMUM_ADD_LIQUIDITY_AMOUNT = 1000n

export const BETTER_TRADE_LESS_HOPS_THRESHOLD = new Percent(50n, BIPS_BASE)

// max hops for swap
export const MAX_HOPS = 3

export const ADDITIONAL_BASES: { [chainId: number]: { [tokenAddress: string]: Token[] } } = {}

export const CUSTOM_BASES: { [chainId: number]: { [tokenAddress: string]: Token[] } } = {}

// todo:@eric mock bases to test multihops
const USDC = testnetTokenList.tokens.find((t) => t.symbol === 'USDC')!
const tTON = testnetTokenList.tokens.find((t) => t.symbol === 'tTON')!

const tUSDT = mainnetTokenList.tokens.find((t) => t.symbol === 'tUSDT')!
const RB4 = mainnetTokenList.tokens.find((t) => t.symbol === 'RB4')!

export const BASES_TO_CHECK_TRADES_AGAINST: { [chainId: number]: Currency[] } = {
  [TonChainId.Testnet]: [
    new Native(NATIVE[TonChainId.Testnet]),
    new Token(USDC.chainId, USDC.address, USDC.decimals, USDC.name, USDC.symbol, USDC.logoURI),
    new Token(tTON.chainId, tTON.address, tTON.decimals, tTON.name, tTON.symbol, tTON.logoURI),
  ] satisfies Currency[],
  [TonChainId.Mainnet]: [
    new Native(NATIVE[TonChainId.Mainnet]),
    new Token(tUSDT.chainId, tUSDT.address, tUSDT.decimals, tUSDT.name, tUSDT.symbol, tUSDT.logoURI),
    new Token(RB4.chainId, RB4.address, RB4.decimals, RB4.name, RB4.symbol, RB4.logoURI),
  ],
}

export const calculateBaseFee = (fee: bigint) => {
  // Correct the decimals since pool fee precision is 3 decimals and BIPS_BASE is 4 decimals
  return new Percent(fee / BigInt(10 ** (BIPS_BASE_DECIMALS - POOL_FEE_DECIMALS)), BIPS_BASE)
}
export const calculateInputFractionAfterFee = (fee: bigint) => ONE_HUNDRED_PERCENT.subtract(calculateBaseFee(fee))
