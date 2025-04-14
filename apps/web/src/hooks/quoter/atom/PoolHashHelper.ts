import { ChainId } from '@pancakeswap/chains'
import { Currency, getCurrencyAddress, sortCurrencies } from '@pancakeswap/swap-sdk-core'
import { keccak256, stringify } from 'viem/utils'
import { QuoteOption } from '../quoter.types'

export interface PoolQuery {
  currencyA?: Currency
  currencyB?: Currency
  options?: PoolsHookParams
  chainId?: ChainId
  infinity: boolean
}
interface PoolsHookParams {
  // Used for caching
  key?: string
  blockNumber?: number
  enabled?: boolean
  gasLimit?: bigint
}

export class PoolHashHelper {
  static hashCurrenciesWithSort(a?: Currency, b?: Currency) {
    const list: Currency[] = []
    if (a) {
      list.push(a)
    }
    if (b && !isEqualCurrency(a, b)) {
      list.push(b)
    }

    const sorted = sortCurrencies(list)
    const str = sorted.map((currency) => getCurrencyAddress(currency)).join(',')
    const hash = keccak256(`0x${str}`)
    return hash
  }

  static hashPoolQuery = (query: PoolQuery) => {
    const { currencyA, currencyB, options, infinity } = query
    try {
      const hash = this.hashCurrenciesWithSort(currencyA, currencyB)
      return keccak256(`0x${hash}-${infinity}-${options?.blockNumber}`)
    } catch (ex) {
      console.error(ex, currencyA, currencyB, options)
      throw ex
    }
  }

  static hashQuoteQuery = (query: QuoteOption) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { amount, currency, slippage, ...rest } = query
    const restHash = keccak256(`0x${stringify(rest)}`)
    const hashCurrencies = PoolHashHelper.hashCurrenciesWithSort(amount?.currency, currency || undefined)
    const prts = [amount?.toExact(), hashCurrencies, restHash]
    return keccak256(`0x${prts.join(':')}`)
  }
}

export const isEqualCurrency = (a: Currency | undefined, b: Currency | undefined) => {
  if (a === b) {
    return true
  }
  if (!a || !b) {
    return false
  }
  return getCurrencyAddress(a) === getCurrencyAddress(b)
}

export const isEqualQuoteQuery = (a: QuoteOption, b: QuoteOption) => {
  return a.hash === b.hash
}

export const isEqualPoolQuery = (a: PoolQuery, b: PoolQuery) => {
  return PoolHashHelper.hashPoolQuery(a) === PoolHashHelper.hashPoolQuery(b)
}
