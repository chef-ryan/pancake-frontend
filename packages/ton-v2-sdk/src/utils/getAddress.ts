import { Currency } from '@pancakeswap/swap-sdk-core'
import { Address, zeroAddress } from 'viem'

// todo:@eric wait for ton's currency type implemented
export const getAddress = (tokenA: Currency, tokenB: Currency): Address => {
  return zeroAddress
}
