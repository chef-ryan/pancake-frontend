import { useAtomValue } from 'jotai'
import { solanaTokenAtomFamily } from 'state/token/solanaTokenAtoms'

import { SPLToken } from '@pancakeswap/swap-sdk-core'
import { useSolanaTokenList } from './useSolanaTokenList'

export function useSolanaToken(address?: string): SPLToken | undefined {
  useSolanaTokenList()
  return useAtomValue(solanaTokenAtomFamily(address))
}
