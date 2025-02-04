import { Address } from '@ton/core'

export const parseAddress = (address: string) => {
  return Address.parse(address)
}
