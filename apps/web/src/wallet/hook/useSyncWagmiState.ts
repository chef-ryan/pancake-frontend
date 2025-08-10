import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useRef } from 'react'

import { getQueryChainId } from 'wallet/util/getQueryChainId'
import { accountActiveChainAtom } from 'wallet/atoms/accountStateAtoms'
import { useAccount, useAccountEffect } from 'wagmi'
import { useSwitchNetworkV2 } from './useSwitchNetworkV2'
import { wagmiConfigAtom } from './useWagmiConfig'

export function useSyncWagmiState() {
  const { chainId: wagmiChainId, address: evmAccount, connector } = useAccount()
  const updAccountState = useSetAtom(accountActiveChainAtom)
  const { switchNetwork } = useSwitchNetworkV2()

  const oldWagmiChainId = useRef(wagmiChainId)
  const wagmiConfig = useAtomValue(wagmiConfigAtom)

  useEffect(() => {
    const verifyWalletChainId = async () => {
      if (wagmiChainId && oldWagmiChainId.current && oldWagmiChainId.current !== wagmiChainId) {
        switchNetwork(wagmiChainId, {
          replaceUrl: true,
          from: 'wagmi',
        })
      }
    }
    verifyWalletChainId()
    oldWagmiChainId.current = wagmiChainId
  }, [wagmiChainId])

  useAccountEffect({
    config: wagmiConfig,
    onConnect: (data) => {
      const { chainId, isReconnected } = data

      if (!isReconnected) {
        console.log(`[chain]`, 'connect-0', chainId)
        switchNetwork(chainId, {
          from: 'wagmi',
          replaceUrl: true,
        })
      } else {
        console.log(`[chain]`, 'connect-1', chainId)
        const urlChain = getQueryChainId()
        if (urlChain !== chainId) {
          switchNetwork(urlChain, {
            from: 'url',
            replaceUrl: true,
          })
        }
      }
    },
  })

  useEffect(() => {
    updAccountState((prev) => ({
      ...prev,
      account: evmAccount,
    }))
  }, [evmAccount, connector])
}
