import { Address, Builder, Cell } from '@ton/core'
import { TON_OPCODES } from '../constants/opcodes'

type SwapNext = {
  $$type: 'SwapNext'
  tokenAddress: Address
  minOut: bigint
  next: Cell | null
}

type Swap = {
  $$type: 'Swap'
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

    const b1 = new Builder()
    if (src.next !== null && src.next !== undefined) {
      b0.storeBit(true)
      b1.store(storeSwapNext(src.next))
    } else {
      b0.storeBit(false)
    }

    b0.storeRef(b1.endCell())
  }
}

export function storeSwapNext(src: SwapNext) {
  return (builder: Builder) => {
    const b0 = builder
    b0.storeAddress(src.tokenAddress)
    b0.storeCoins(src.minOut)
    if (src.next !== null && src.next !== undefined) {
      b0.storeBit(true).storeRef(src.next)
    } else {
      b0.storeBit(false)
    }
  }
}
