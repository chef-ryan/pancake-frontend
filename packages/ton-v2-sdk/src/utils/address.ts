import { Address, beginCell } from '@ton/core'

export const getAddressCellHash = (address: string) => beginCell().storeAddress(Address.parse(address)).endCell().hash()
