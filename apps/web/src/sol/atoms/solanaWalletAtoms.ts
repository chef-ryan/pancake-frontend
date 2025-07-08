import { atom } from 'jotai'

export type SolanaWalletStatus = 'connected' | 'disconnected' | 'connecting' | 'reconnecting' | null

export interface SolanaWalletState {
  account: string | null
  status: SolanaWalletStatus
}

export const solanaWalletModalAtom = atom(false)

export const solanaWalletStateAtom = atom<SolanaWalletState>({
  account: null,
  status: null,
})
