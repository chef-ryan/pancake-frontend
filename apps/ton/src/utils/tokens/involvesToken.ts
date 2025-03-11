import { Currency, Pair } from '@pancakeswap/ton-v2-sdk'

export const involvesToken = (token: Currency, pair: Pair) => token.equals(pair.token0) || token.equals(pair.token1)
