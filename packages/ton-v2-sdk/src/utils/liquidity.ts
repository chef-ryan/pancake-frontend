import type { Address, Builder } from '@ton/core'
import { TON_OPCODES } from '../constants'

export type AddLiquidity = {
  minLPOut: bigint
  tokenWallet: Address
}

export function storeAddLiquidity(src: AddLiquidity) {
  return (builder: Builder) => {
    builder.storeUint(TON_OPCODES.ADD_LIQUIDITY, 32).storeAddress(src.tokenWallet).storeCoins(src.minLPOut)
  }
}
