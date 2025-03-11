import { Currency, Pair } from '@pancakeswap/ton-v2-sdk'

export const getReserveOfToken = (token: Currency, pair: Pair) =>
  token.equals(pair.token0) ? pair.reserve0 : pair.reserve1
