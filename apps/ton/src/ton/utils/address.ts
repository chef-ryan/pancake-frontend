import { Address } from '@ton/core'

export const parseAddress = (address?: string) => {
  if (!address) return Address.parse('0:0000000000000000000000000000000000000000000000000000000000000000')
  return Address.parse(address)
}

export const isAddress = (address?: any) => {
  if (!address) return false
  try {
    return !!Address.parse(address)
  } catch {
    return false
  }
}

export const isAddressEqual = (address0: string, address1: string) => {
  return Address.parse(address0).toString() === Address.parse(address1).toString()
}
