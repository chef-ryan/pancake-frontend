import { Address as TonAddress } from '@ton/core'
// todo:@eric replaced to TON currency type
import { Currency, CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import type { Pool } from '@pancakeswap/routing-sdk'
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
