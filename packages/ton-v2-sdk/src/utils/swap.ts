import { TradeType } from '@pancakeswap/swap-sdk-core'
import { Currency } from '../constants'
import { Trade } from './trade'
import { SwapParameters, TradeOptions, TradeOptionsDeadline } from '../types'

export const swapCallParameters = (
  trade: Trade<Currency, Currency, TradeType>,
  options: TradeOptions | TradeOptionsDeadline,
): SwapParameters => {
  return {
    methodName: '',
    args: [],
    value: '0x',
  }
}
