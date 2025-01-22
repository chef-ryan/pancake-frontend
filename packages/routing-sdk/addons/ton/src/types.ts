import { Pool } from '@pancakeswap/routing-sdk'
import { CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { TON_V2_POOL_TYPE } from './consts'
import { Currency } from './currency'

export type TonV2PoolType = typeof TON_V2_POOL_TYPE
export type TonV2PoolData = {
  reserve0: CurrencyAmount<Currency>
  reserve1: CurrencyAmount<Currency>
}
export type TonV2Pool = Pool<TonV2PoolType, TonV2PoolData>
