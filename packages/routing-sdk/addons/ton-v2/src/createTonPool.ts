import {
  getPairAddress,
  getInputAmount,
  getOutputAmount,
  priceOf,
  CurrencyAmount,
  Price,
} from '@pancakeswap/ton-v2-sdk'

import type { TonPool, TonPoolData } from './types'
import { TON_POOL_TYPE } from './constants'
import { BASE_SWAP_COST_TON_V2, COST_PER_EXTRA_HOP_TON_V2 } from './constants/gasCost'

export function createTonPool(params: TonPoolData): TonPool {
  let p = { ...params, type: TON_POOL_TYPE }
  const getPoolId = (poolData: TonPoolData) => {
    return getPairAddress(poolData.reserve0.currency.wrapped, poolData.reserve1.currency.wrapped).toString()
  }
  let address = getPoolId(p)

  const pool: TonPool = {
    type: TON_POOL_TYPE,
    getReserve: (c) => (p.reserve0.currency.wrapped.equals(c.wrapped) ? p.reserve0 : p.reserve1),
    getCurrentPrice: (base) => {
      const price = priceOf(base.wrapped, p.reserve0, p.reserve1)
      const [baseCurrency, quoteCurrency] = price.baseCurrency.wrapped.equals(p.reserve0.currency.wrapped)
        ? [p.reserve0.currency, p.reserve1.currency]
        : [p.reserve1.currency, p.reserve0.currency]
      return new Price(baseCurrency, quoteCurrency, price.denominator, price.numerator)
    },
    getTradingPairs: () => [[p.reserve0.currency, p.reserve1.currency]],
    getId: () => address,
    update: (poolData) => {
      p = { ...p, ...poolData }
      address = getPoolId(p)
    },
    log: () =>
      `${TON_POOL_TYPE} ${p.reserve0.currency.symbol} - ${p.reserve1.currency.symbol} (${address} - price ${pool
        .getCurrentPrice(p.reserve0.currency, p.reserve1.currency)
        .toSignificant(6)} ${p.reserve1.currency.symbol}/${p.reserve0.currency.symbol}`,

    getPoolData: () => p,

    getQuote: ({ amount, isExactIn }) => {
      const parInfo = {
        reserve0: p.reserve0,
        reserve1: p.reserve1,
        token0: p.token0,
        token1: p.token1,
      }
      const quoteCurrency = amount.currency.wrapped.equals(p.reserve0.currency.wrapped)
        ? p.reserve1.currency
        : p.reserve0.currency
      const [quoteAmount, pairAfter] = isExactIn ? getOutputAmount(amount, parInfo) : getInputAmount(amount, parInfo)
      const quote = CurrencyAmount.fromRawAmount(quoteCurrency, quoteAmount.quotient)
      const newPool = {
        ...p,
        reserve0: CurrencyAmount.fromRawAmount(p.reserve0.currency, pairAfter.reserve0.quotient),
        reserve1: CurrencyAmount.fromRawAmount(p.reserve1.currency, pairAfter.reserve1.quotient),
      }
      return {
        quote,
        poolAfter: createTonPool(newPool),
        pool,
      }
    },

    estimateGasCostForQuote: () => {
      return BASE_SWAP_COST_TON_V2 + COST_PER_EXTRA_HOP_TON_V2
    },
  }

  return pool
}
