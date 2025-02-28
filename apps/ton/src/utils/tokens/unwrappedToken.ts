import { Currency, Native, WNATIVE } from '@pancakeswap/ton-v2-sdk'

export function unwrappedToken(token?: Currency): Currency | undefined {
  if (token && token.equals(WNATIVE[token.chainId as keyof typeof WNATIVE])) return Native.onChain(token.chainId)
  return token
}
