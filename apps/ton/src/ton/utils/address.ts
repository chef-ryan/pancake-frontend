import { Currency } from '@pancakeswap/ton-v2-sdk'
import { Address } from '@ton/core'
import { JettonMaster, TonClient } from '@ton/ton'

export const parseAddress = (address?: string) => {
  if (!address) return Address.parse('0:0000000000000000000000000000000000000000000000000000000000000000')
  return Address.parse(address)
}

export const isAddress = (address?: any) => {
  if (!address) return false
  return Address.isAddress(address)
}

export const getJettonWalletAddress = async (client: TonClient, userAddress: Address, currency: Currency) => {
  const jettonMaster = client.open(JettonMaster.create(parseAddress(currency.wrapped.address)))
  return jettonMaster.getWalletAddress(userAddress)
}

export function getCurrencyOrder(currency0: Currency, currency1: Currency) {
  if (!currency0 || !currency1) return { currency0, currency1, isFlipped: false }
  if (currency0.isNative) return { currency0, currency1, isFlipped: false }
  if (currency1.isNative) return { currency0: currency1, currency1: currency0, isFlipped: true }

  return currency0.sortsBefore(currency1)
    ? { currency0, currency1, isFlipped: false }
    : { currency0: currency1, currency1: currency0, isFlipped: true }
}

export function getTokenOrder(token0Address: string, token1Address: string) {
  const token0Hash = Address.parse(token0Address).hash
  const token1Hash = Address.parse(token1Address).hash

  if (token0Hash > token1Hash) {
    return { token0: token1Address, token1: token0Address }
  }

  return { token0: token0Address, token1: token1Address }
}
