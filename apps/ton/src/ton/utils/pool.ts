import { BigintIsh } from '@pancakeswap/swap-sdk-core'
import BN from 'bignumber.js'
import { REQUIRED_MIN_LIQUIDITY } from 'config/constants/exchange'
import { LP_TOKEN_DECIMALS } from 'config/constants/formatting'

interface GetExpectedLpTokensArgs {
  /**
   * Amount of token0 in user-friendly format (Example: 700, 50, etc.)
   */
  amount0: BigintIsh
  /**
   * Amount of token1 in user-friendly format (Example: 700, 50, etc.)
   */
  amount1: BigintIsh
  reserve0: BigintIsh
  reserve1: BigintIsh
  totalSupply: BigintIsh
}
export function getExpectedPoolTokens({ amount0, amount1, reserve0, reserve1, totalSupply }: GetExpectedLpTokensArgs) {
  const a0 = BN(amount0.toString())
  const a1 = BN(amount1.toString())
  const r0 = BN(reserve0.toString())
  const r1 = BN(reserve1.toString())
  const supply = BN(totalSupply.toString())

  if (supply.isZero()) {
    return a0
      .multipliedBy(a1)
      .sqrt()
      .minus(BN(REQUIRED_MIN_LIQUIDITY).div(10 ** LP_TOKEN_DECIMALS))
  }

  return BN.min(a0.multipliedBy(supply).div(r0), a1.multipliedBy(supply).div(r1))
}

/**
 * Get user's share from creating a new pool (Should be static)
 * @param expectedTokens Expected Tokens in parsed form
 */
export function getNewPoolShare(expectedTokens: string) {
  return BN(expectedTokens)
    .minus(BN(REQUIRED_MIN_LIQUIDITY).div(10 ** LP_TOKEN_DECIMALS))
    .div(BN(expectedTokens))
    .multipliedBy(100)
}
