import { TonNetworks } from '@pancakeswap/ton-v2-sdk'
import { atomWithProxy } from 'jotai-valtio'
import { proxy } from 'valtio'

function detectNetwork() {
  // const isProd = process.env.NODE_ENV === 'production'
  // const guess = isProd ? TonNetworks.Mainnet : TonNetworks.Testnet
  const guess = TonNetworks.Mainnet

  if (typeof window === 'undefined') {
    return guess
  }

  const url = new URL(window.location.href)
  let network = url.searchParams.get('chain') || guess

  if (network !== TonNetworks.Mainnet && network !== TonNetworks.Testnet) {
    network = guess
  }

  return network as TonNetworks
}

export const tonState = proxy({
  address: '',
  network: detectNetwork(),
})

export const tonStateAtom = atomWithProxy(tonState)
