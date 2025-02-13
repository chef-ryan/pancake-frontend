import { TonChainId, TonNetworks } from '@pancakeswap/ton-v2-sdk'
import { atom } from 'jotai'
import { tonStateAtom } from './tonStateAtom'

export const chainIdAtom = atom((get) =>
  get(tonStateAtom).network === TonNetworks.Mainnet ? TonChainId.Mainnet : TonChainId.Testnet,
)
