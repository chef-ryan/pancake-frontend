import { Address } from '@ton/core'
import { atom } from 'jotai'
import { TonContext } from 'ton/context/TonContext'
import { addressAtom } from '../context/addressAtom'

export const balanceOfNativeAtom = atom(async (get) => {
  const client = TonContext.instance.getClient()
  const address = get(addressAtom)
  if (!address) {
    return null
  }
  const balance = await client.getBalance(Address.parse(address))
  return balance
})
