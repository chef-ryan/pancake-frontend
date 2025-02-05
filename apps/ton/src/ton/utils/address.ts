import { Address } from '@ton/core'

export const parseAddress = (address?: string) => {
  if (!address) return Address.parse('')
  return Address.parse(address)
}
