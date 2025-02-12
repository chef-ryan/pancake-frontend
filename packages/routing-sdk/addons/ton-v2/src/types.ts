import { Currency, CurrencyAmount, Price } from '@pancakeswap/ton-v2-sdk'
import { Address as TonAddress } from '@ton/core'
import { TON_POOL_TYPE } from './constants'

export type Address = TonAddress

export type TonPoolData = {
  router: Address
  token0: Currency
  token1: Currency
  reserve0: CurrencyAmount<Currency>
  reserve1: CurrencyAmount<Currency>
  lpFee: bigint
  protocolFee: bigint
  refFee?: bigint
}

export type TonPoolType = typeof TON_POOL_TYPE

export type TonPool = Pool<TonPoolType, TonPoolData>

export type PoolQuoteResult = {
  quote: CurrencyAmount<Currency>
  poolAfter: Pool
}
export type Pool<PType = any, PoolData = any> = {
  getReserve: (c: Currency) => CurrencyAmount<Currency>
  getCurrentPrice: (base: Currency, quote: Currency) => Price<Currency, Currency>

  // Get possible trading pairs of the pool
  getTradingPairs: () => [Currency, Currency][]

  // Get unique id for the pool
  getId: () => string

  getQuote: (params: {
    amount: CurrencyAmount<Currency>
    isExactIn: boolean
    quoteCurrency: Currency
  }) => PoolQuoteResult | undefined

  estimateGasCostForQuote: (quote: PoolQuoteResult) => bigint

  swapToPrice?: (p: Price<Currency, Currency>) => {
    inputAmount: CurrencyAmount<Currency>
  }

  log: () => string

  getPoolData: () => PoolData

  update: (p: Partial<PoolData>) => void

  type: PType
}
