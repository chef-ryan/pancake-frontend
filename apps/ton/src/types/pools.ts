import BN from 'bignumber.js'

export interface RawPoolData {
  balance?: bigint
  poolAddress: string
}

export interface InitialPoolData extends RawPoolData {
  token0: string
  token1: string
}

export interface CombinedPoolData extends Omit<InitialPoolData, 'balance'> {
  balance: BN
  amount0: BN
  amount1: BN
  reserve0: BN
  reserve1: BN
  totalSupply: BN
  userShare?: number
}

export interface PoolInfo {
  reserve0: bigint
  reserve1: bigint
  totalSupply: bigint
}

// Refund Modal
export interface RefundPool {
  token0: string
  token1: string
  poolAddress: string
  lpAccountAddress: string
  refundAmount0: BN
  refundAmount1: BN
}
