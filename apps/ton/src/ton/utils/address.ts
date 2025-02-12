import { Currency } from '@pancakeswap/ton-v2-sdk'
import { Address } from '@ton/core'
import { JettonMaster, TonClient } from '@ton/ton'

export const parseAddress = (address?: string) => {
  if (!address) return Address.parse('')
  return Address.parse(address)
}

export const isAddress = (address?: string) => {
  if (!address) return false
  return Address.isAddress(address)
}

export const getJettonWalletAddress = async (client: TonClient, userAddress: Address, currency: Currency) => {
  if (currency.isNative) {
    return userAddress
  }
  const jettonMaster0 = client.open(JettonMaster.create(parseAddress(currency.address)))
  return jettonMaster0.getWalletAddress(userAddress)
}
