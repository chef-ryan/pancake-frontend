import { ChainId, getChainIdByChainName, isEvm, NonEVMChainId } from '@pancakeswap/chains'
import safeGetWindow from '@pancakeswap/utils/safeGetWindow'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { atomWithProxy } from 'jotai-valtio'
import { atomWithRefresh } from 'jotai/utils'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { proxy } from 'valtio'
import { useAccount } from 'wagmi'
import { useSwitchNetworkLocal } from './useSwitchNetwork'
import { useValueChanged } from './useValueChanged'

function getQueryChainId() {
  const window = safeGetWindow()
  if (!window) {
    return ChainId.BSC
  }
  const params = new URL(window.location.href).searchParams
  let chainId
  const c = params.get('chain')
  if (!c) {
    chainId = params.get('chainId')
  } else {
    chainId = getChainIdByChainName(c)
  }
  return +chainId || ChainId.BSC
}

export const queryChainIdAtom = atomWithRefresh(getQueryChainId)

export const useLocalNetworkChain = () => {
  return useAtomValue(queryChainIdAtom)
}

export const useActiveChainId = (checkChainId?: number) => {
  const { isNotMatched, isWrongNetwork, chainId } = useAccountActiveChain()
  return {
    chainId,
    isNotMatched,
    isWrongNetwork: checkChainId ? isWrongNetwork && checkChainId !== chainId : isWrongNetwork,
  }
}

interface AccountChainState {
  account?: `0x${string}`
  solanaAccount?: string | null
  unifiedAccount?: string | null
  chainId: number
  isWrongNetwork: boolean
  isNotMatched: boolean
  status: 'connected' | 'disconnected' | 'connecting' | 'reconnecting' | null
}

const accountChainProxy = proxy<AccountChainState>({
  chainId: ChainId.BSC,
  isWrongNetwork: false,
  status: null,
  solanaAccount: null,
  unifiedAccount: null,
  isNotMatched: false,
})
export const accountActiveChainAtom = atomWithProxy(accountChainProxy)

const useAccountActiveChain = () => {
  return useAtomValue(accountActiveChainAtom)
}

export function useSyncWalletState() {
  const [queryChainId, refresh] = useAtom(queryChainIdAtom)

  const { query } = useRouter()
  const chain = query.chain
  const wagmiAccountState = useAccount()
  const switchNetwork = useSwitchNetworkLocal()
  const setProxy = useSetAtom(accountActiveChainAtom)

  // Query Change
  useValueChanged(() => {
    if (chain) {
      refresh()
    }
  }, [chain, refresh])

  // wagmi change
  useValueChanged(() => {
    const { chainId: wagmiChainId } = wagmiAccountState
    if (wagmiChainId && isEvm(queryChainId)) {
      switchNetwork(wagmiChainId)
    }
  }, [wagmiAccountState])

  // query chainId Changes
  // sync chainId
  useEffect(() => {
    const wagmiState = wagmiAccountState
    const { chainId: wagmiChainId, address } = wagmiState
    const chainId = queryChainId

    const isNotMatched = isEvm(chainId)
      ? Boolean(wagmiChainId && wagmiChainId !== chainId)
      : chainId !== NonEVMChainId.SOLANA

    setProxy((prev) => {
      return {
        ...prev,
        chainId, // Using this as single source of truth
        account: address,
        unifiedAccount: chainId === NonEVMChainId.SOLANA ? prev.solanaAccount : address,
        isWrongNetwork: isNotMatched,
        isNotMatched,
      }
    })
  }, [queryChainId])
}

export default useAccountActiveChain
