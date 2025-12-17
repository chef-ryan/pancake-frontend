import { useEffect, useRef } from 'react'
import { useSwitchNetwork } from './useSwitchNetwork'
import { useActiveChainId } from './useAccountActiveChain'

export const useCheckAndSwitchChain = (targetChainId?: number) => {
  const { chainId: currentChainId } = useActiveChainId()
  const { switchNetwork, canSwitch, isLoading } = useSwitchNetwork()
  const attemptedSwitchRef = useRef<number | null>(null)

  useEffect(() => {
    if (!targetChainId) {
      return
    }

    if (currentChainId === targetChainId) {
      attemptedSwitchRef.current = null
      return
    }

    if (!canSwitch || isLoading || attemptedSwitchRef.current === targetChainId) {
      return
    }

    attemptedSwitchRef.current = targetChainId
    switchNetwork(targetChainId).catch(() => {
      attemptedSwitchRef.current = null
    })
  }, [canSwitch, currentChainId, isLoading, switchNetwork, targetChainId])
}
