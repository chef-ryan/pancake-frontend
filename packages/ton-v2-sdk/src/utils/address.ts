import { Address, beginCell } from '@ton/core'

export const getAddressCellHash = (address: string) =>
  BigInt(`0x${beginCell().storeAddress(Address.parse(address)).endCell().hash().toString('hex')}`)
