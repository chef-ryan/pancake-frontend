import { Address } from '@ton/core'
import { Currency } from '../constants'

// todo:@eric wait for ton's currency type implemented
export const getPairAddress = (tokenA: Currency, tokenB: Currency): Address => {
  return Address.parse(tokenA.wrapped.address)
}
