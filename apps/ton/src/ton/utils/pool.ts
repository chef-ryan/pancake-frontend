import { BigintIsh } from '@pancakeswap/swap-sdk-core'
import BN from 'bignumber.js'

interface GetExpectedLpTokensArgs {
  amount0: BigintIsh
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
    return a0.multipliedBy(a1).sqrt().minus(BN('1000'))
  }

  return BN.min(a0.multipliedBy(supply).div(r0), a1.multipliedBy(supply).div(r1))
}
