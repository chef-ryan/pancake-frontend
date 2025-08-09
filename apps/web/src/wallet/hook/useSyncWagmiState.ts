import { useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'

import { useAccount, useAccountEffect } from 'wagmi'
import { accountActiveChainAtom } from 'wallet/atoms/accountStateAtoms'
import { switchChainRequestAtom } from 'wallet/atoms/switchChainRequestAtom'

export function useSyncWagmiState() {
  const { chainId: wagmiChainId, address: evmAccount, connector } = useAccount()
  const updateRequestChain = useSetAtom(switchChainRequestAtom)
  const updAccountState = useSetAtom(accountActiveChainAtom)

  const oldWagmiChainId = useRef(wagmiChainId)

  useEffect(() => {
    const verifyWalletChainId = async () => {
      if (wagmiChainId && oldWagmiChainId.current && oldWagmiChainId.current !== wagmiChainId) {
        updateRequestChain((prev) => ({
          ...prev,
          chainId: wagmiChainId,
          replaceUrl: true,
          evmAddress: evmAccount,
          from: 'wagmi',
        }))
      }
    }
    verifyWalletChainId()
    oldWagmiChainId.current = wagmiChainId
  }, [wagmiChainId])

  useEffect(() => {
    updAccountState((prev) => ({
      ...prev,
      account: evmAccount,
    }))
  }, [evmAccount, connector])
}
