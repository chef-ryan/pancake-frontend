import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useMemo } from 'react'
import { useAccount, useSwitchChain } from 'wagmi'
import { switchChainRequestAtom, switchChainUpdatingAtom } from 'wallet/atoms/switchChainRequestAtom'

export interface SwitchChainOption {
  replaceUrl?: boolean
  from: 'wagmi' | 'url' | 'switch'
}
export const useSwitchNetworkV2 = () => {
  const updateSwitchChainRequest = useSetAtom(switchChainRequestAtom)
  const { isConnected } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const switching = useAtomValue(switchChainUpdatingAtom)

  const switchChain = useCallback(
    (
      chainId: number,
      option: SwitchChainOption = {
        replaceUrl: true,
        from: 'switch',
      },
    ) => {
      const { replaceUrl, from } = option
      console.log(`[chain]`, 'switchChain', chainId, replaceUrl)
      updateSwitchChainRequest((prev) => ({
        ...prev,
        chainId,
        replaceUrl: Boolean(replaceUrl),
        from,
      }))
    },
    [],
  )

  const canSwitch = useMemo(
    () =>
      isConnected
        ? !!switchChainAsync &&
          !(
            typeof window !== 'undefined' &&
            // @ts-ignore // TODO: add type later
            window.ethereum?.isMathWallet
          )
        : true,
    [switchChainAsync, isConnected],
  )

  return { switchNetwork: switchChain, canSwitch, isLoading: switching }
}
