import { atomWithProxy } from 'jotai-valtio'
import { TonNetworks } from 'ton/ton.enums'
import { proxy } from 'valtio'

function detectNetwork() {
  const isProd = process.env.NODE_ENV === 'production'
  const guess = isProd ? TonNetworks.Mainnet : TonNetworks.Testnet
  if (typeof window === 'undefined') {
    return guess
  }
  const url = new URL(window.location.href)
  const network = url.searchParams.get('chain') || guess

  return network as TonNetworks
}

export const tonState = proxy({
  address: '',
  network: detectNetwork(),
})

export const tonStateAtom = atomWithProxy(tonState)
