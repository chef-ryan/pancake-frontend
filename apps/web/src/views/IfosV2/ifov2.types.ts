import type { Currency, CurrencyAmount, Price } from '@pancakeswap/swap-sdk-core'
import type { Address } from 'viem'

export interface PoolInfo {
  pid: number
  /**
   * token address that is used to stake in the pool
   */
  poolToken: Address
  /**
   * Amount of tokens raised in the pool
   */
  raisingAmountPool: bigint
  /**
   * Amount of tokens offered in the pool
   *
   * if pool is not offering tokens, it will be 0
   */
  offeringAmountPool: bigint
  /**
   * Maximum amount of tokens a user can stake in the pool
   */
  capPerUserInLP: bigint
  /**
   * If the pool has tax on overflow
   */
  hasTax: boolean
  /**
   * Flat tax rate for overflow
   */
  flatTaxRate: bigint
  /**
   * Total amount of tokens staked in the pool
   */
  totalAmountPool: bigint
  /**
   * Currency used to stake in the pool
   */
  currency?: Currency
  /**
   * Price of the offering token denominated in the staking currency
   */
  price?: Price<Currency, Currency>
  /**
   * Total raising amount in the staking currency
   */
  raise?: CurrencyAmount<Currency>
}

export default PoolInfo
