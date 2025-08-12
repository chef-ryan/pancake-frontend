import { ChainId } from '@pancakeswap/chains'
import { atom } from 'jotai'
import { atomWithProxy } from 'jotai-valtio'
import { proxy } from 'valtio/vanilla'
import { Connector } from 'wagmi'
import { getQueryChainId } from 'wallet/util/getQueryChainId'

interface AccountChainState {
  account?: `0x${string}`
  solanaAccount?: string | null
  chainId: number
  isWrongNetwork: boolean
  isNotMatched: boolean
  status: 'connected' | 'disconnected' | 'connecting' | 'reconnecting' | null
}

export const accountChainProxy = proxy<AccountChainState>({
  chainId: getQueryChainId() || ChainId.BSC, // Mount with initial chain ID
  isWrongNetwork: false,
  status: null,
  solanaAccount: null,
  isNotMatched: false,
})

export const currentConnectorAtom = atom<Connector | null>(null)

export const accountActiveChainAtom = atomWithProxy(accountChainProxy)
