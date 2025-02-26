import { Address } from '@ton/core'

export const parseAddress = (address?: string) => {
  if (!address) return Address.parse('0:0000000000000000000000000000000000000000000000000000000000000000')
  return Address.parse(address)
}

export const isAddress = (address?: any) => {
  if (!address) return false
  return Address.isAddress(address)
}
