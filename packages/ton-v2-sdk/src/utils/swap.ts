import { Address, Builder, beginCell } from '@ton/core'
import { TON_OPCODES } from '../constants/opcodes'

type SwapNext = {
  tokenAddress: Address
  minOut: bigint
  next: SwapNext | null
}

type Swap = {
  fromUserAddress: Address
  tokenWallet: Address
  minOut: bigint
  fromRealUser: Address
  refAddress: Address | null
  refMessageValue: bigint
  next: SwapNext | null
}

export function storeSwap(src: Swap) {
  return (builder: Builder) => {
    const b0 = builder
    b0.storeUint(TON_OPCODES.SWAP, 32)
      .storeAddress(src.tokenWallet)
      .storeCoins(src.minOut)
      .storeAddress(src.fromUserAddress)
    if (src.refAddress !== null) {
      b0.storeBit(true).storeAddress(src.refAddress)
    } else {
      b0.storeBit(false)
    }
    b0.storeCoins(src.refMessageValue)

    b0.storeMaybeRef(src.next ? storeSwapNext(src.next).endCell() : null)
  }
}

export function storeSwapNext(src: SwapNext) {
  const b0 = beginCell()
  b0.storeAddress(src.tokenAddress)
  b0.storeCoins(src.minOut)
  b0.storeMaybeRef(src.next ? storeSwapNext(src.next).endCell() : null)
  return b0
}
