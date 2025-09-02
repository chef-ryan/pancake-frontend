import type { ChainId } from '@pancakeswap/chains'
import type { IfoStatus } from '@pancakeswap/ifos'
import type { Currency, CurrencyAmount, Price } from '@pancakeswap/swap-sdk-core'
import type { ReactNode } from 'react'
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
   * Total amount of tokens staked in the pool
   */
  totalAmountPool: bigint
  /**
   * Sum of taxes collected from overflow
   */
  sumTaxesOverflow: bigint
  /**
   * Flat tax rate for overflow
   */
  flatTaxRate: bigint
  /**
   * Currency used to stake in the pool
   */
  stakeCurrency?: Currency
  /**
   * Price of the offering token denominated in the staking currency
   */
  price?: Price<Currency, Currency>
  /**
   * Total raising amount in the staking currency
   */
  raise?: CurrencyAmount<Currency>
  /**
   * Total offering amount in the offering currency
   */
  saleAmount?: CurrencyAmount<Currency>
}

export type IFOConfig = {
  id: string
  icon: string
  projectUrl: string
  chainId: ChainId
  bannerUrl: string
  tgeTitle: ReactNode
  tgeSubtitle: ReactNode
  description: ReactNode
  ineligibleContent?: ReactNode
  contractAddress: Address
  faqs?: IFOFAQs
}

export type IFOFAQs = Array<{ title: ReactNode; description: ReactNode }>

export interface VestingInfo {
  startTime: number
  percentage: number
  cliff: number
  duration: number
  rate: number
}

export interface IfoInfo {
  startTimestamp: number
  endTimestamp: number
  duration: number
  totalSalesAmount: CurrencyAmount<Currency> | undefined
  status: IfoStatus
  ready: boolean
  vestingInfo?: VestingInfo
  offeringCurrency?: Currency
}

export interface IfoPoolDisplay {
  flatTaxRate: number
  totalCommittedPercent: string
  raiseAmountText: string
}

export interface IfoDisplay {
  startDisplay: { date: string; time: string }
  endDisplay: { date: string; time: string }
  preSaleDurationText: string
  pools: IfoPoolDisplay[]
}
