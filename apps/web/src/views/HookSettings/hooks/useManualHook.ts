import { type HookData } from '@pancakeswap/infinity-sdk'
import { useSelectIdRouteParams } from 'hooks/dynamicRoute/useSelectIdRoute'
import { useHookByAddress } from 'hooks/infinity/useHooksList'
import { useQueryState } from 'nuqs'
import { useCallback, useEffect, useMemo } from 'react'
import { Address } from 'viem/accounts'
import { isAddress } from 'viem/utils'

import { useSelectHookFromList } from './useSelectHookFromList'
import { useDebouncedVerifyHookAddress } from './useVerifyHookAddress'

// from manual input hook address
export const useManualHook = () => {
  const { chainId } = useSelectIdRouteParams()

  const [manualHookAddress, setManualHookAddress] = useQueryState('manualHook', { shallow: true, defaultValue: '' })
  const [, setHook] = useSelectHookFromList()
  const hookDataInList = useHookByAddress(chainId, manualHookAddress as Address)
  const { isLoading, isVerified, isUpgradable } = useDebouncedVerifyHookAddress({
    chainId,
    hookAddress: manualHookAddress,
  })

  const manualHook = useMemo(() => {
    if (hookDataInList) {
      return hookDataInList
    }
    if (!manualHookAddress || !isAddress(manualHookAddress)) return undefined
    const hookData: HookData = {
      address: manualHookAddress,
      isVerified,
      isUpgradable,
    }
    return hookData
  }, [manualHookAddress, hookDataInList, isVerified, isUpgradable])

  const setManualHook = useCallback(
    (value?: string) => {
      setManualHookAddress(value ?? null)
    },
    [setManualHookAddress],
  )

  useEffect(() => {
    if (hookDataInList) {
      setHook(manualHook)
    }
  }, [hookDataInList, manualHook, setHook])

  return { manualHookAddress, manualHook, setManualHook, isVerifing: isLoading }
}
