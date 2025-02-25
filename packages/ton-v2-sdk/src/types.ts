import { Percent } from '@pancakeswap/swap-sdk-core'
import { Hex } from 'viem'
import { Currency } from './currency'
import { CurrencyAmount } from './fractions/CurrencyAmount'

export interface TradeOptions {
  /**
   * How much the execution price is allowed to move unfavorably from the trade execution price.
   */
  allowedSlippage: Percent
  /**
   * How long the swap is valid until it expires, in seconds.
   * This will be used to produce a `deadline` parameter which is computed from when the swap call parameters
   * are generated.
   */
  ttl: number
  /**
   * The account that should receive the output of the swap.
   */
  recipient: string

  /**
   * Whether any of the tokens in the path are fee on transfer tokens, which should be handled with special methods
   */
  feeOnTransfer?: boolean
}

export interface TradeOptionsDeadline extends Omit<TradeOptions, 'ttl'> {
  /**
   * When the transaction expires.
   * This is an atlernate to specifying the ttl, for when you do not want to use local time.
   */
  deadline: number
}

/**
 * The parameters to use in the call to the Pancake Router to execute a trade.
 */
export interface SwapParameters {
  /**
   * The method to call on the Pancake Router.
   */
  methodName: string
  /**
   * The arguments to pass to the method, all hex encoded.
   */
  args: Array<Hex | Hex[] | unknown>
  /**
   * The amount of wei to send in hex.
   */
  value: Hex
}

export interface Pair {
  readonly chainId: number
  readonly token0: Currency
  readonly token1: Currency
  readonly reserve0: CurrencyAmount<Currency>
  readonly reserve1: CurrencyAmount<Currency>
}
