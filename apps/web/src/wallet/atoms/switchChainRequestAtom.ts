import { atom } from 'jotai'
import { proxy } from 'valtio/vanilla'
import { Connector } from 'wagmi'
import { getQueryChainId } from 'wallet/util/getQueryChainId'

export interface SwitchChainRequest {
  chainId: number
  replaceUrl: boolean // Replace url with chainId if succ
  wagmiConnector?: Connector // Connector used to switch chain
  evmAddress?: `0x${string}` // EVM address used to check session sync
  from: 'wagmi' | 'url' | 'switch'
  path: string
}

export const switchChainUpdatingAtom = atom(false)
