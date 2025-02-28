import { Currency } from '@pancakeswap/ton-v2-sdk'
import { currencyKey } from './tokens/currency'

export const getAddLiquidityLink = (currency0?: Currency, currency1?: Currency) => {
  const key0 = currencyKey(currency0)
  const key1 = currencyKey(currency1)
  return `/liquidity/add/${key0}/${key1}`
}

export const getRemoveLiquidityLink = (currency0?: Currency, currency1?: Currency) => {
  const key0 = currencyKey(currency0)
  const key1 = currencyKey(currency1)
  return `/liquidity/remove/${key0}/${key1}`
}
