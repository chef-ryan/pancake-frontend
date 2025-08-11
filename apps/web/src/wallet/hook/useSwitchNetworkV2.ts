import { getChainName, isEvm } from '@pancakeswap/chains'
import { useActiveChainIdRef } from 'hooks/useAccountActiveChain'
import useAuth from 'hooks/useAuth'
import { useAtomValue, useSetAtom } from 'jotai'
import { useRouter } from 'next/router'
import { useCallback, useMemo, useRef } from 'react'
import { Connector, useAccount, useSwitchChain } from 'wagmi'
import { accountActiveChainAtom } from 'wallet/atoms/accountStateAtoms'
import { SwitchChainRequest, switchChainUpdatingAtom } from 'wallet/atoms/switchChainRequestAtom'
import { SOLANA_SUPPORTED_PATH } from 'wallet/network.switch.config'

export interface SwitchChainOption {
  replaceUrl?: boolean
  from: 'wagmi' | 'url' | 'switch'
}
export const useSwitchNetworkV2 = () => {
  const { isConnected } = useAccount()
  const { switchChainAsync } = useSwitchChain()
  const switching = useAtomValue(switchChainUpdatingAtom)
  const { address: evmAddress, connector: wagmiConnector } = useAccount()
  const processSwitching = useProcessSwitchChainRequest()

  const switchChain = useCallback(
    (
      chainId: number,
      option: SwitchChainOption = {
        replaceUrl: true,
        from: 'switch',
      },
    ) => {
      const { replaceUrl, from } = option
      const request: SwitchChainRequest = {
        chainId,
        replaceUrl: Boolean(replaceUrl),
        evmAddress,
        wagmiConnector,
        path: window.location.pathname,
        from,
      }

      return processSwitching(request)
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

  const canSwitchToChain = useCallback(
    (chainId: number) => {
      if (!isEvm(chainId)) {
        return true
      }
      return isConnected
        ? !!switchChainAsync &&
            !(
              typeof window !== 'undefined' &&
              // @ts-ignore // TODO: add type later
              window.ethereum?.isMathWallet
            )
        : true
    },
    [switchChainAsync, isConnected],
  )

  return { switchNetwork: switchChain, canSwitch, isLoading: switching, canSwitchToChain }
}

const requireLogout = async (connector: Connector, chainId: number, address: `0x${string}` | undefined) => {
  try {
    if (typeof connector.getProvider !== 'function') return false

    const provider = (await connector.getProvider()) as any

    return Boolean(
      provider &&
        Array.isArray(provider.session?.namespaces?.eip155?.accounts) &&
        !provider.session.namespaces.eip155.accounts.some((account: string) =>
          account?.includes(`${chainId}:${address}`),
        ),
    )
  } catch (error) {
    console.error(error, 'Error detecting provider')
    return false
  }
}

const useProcessSwitchChainRequest = () => {
  const { switchChainAsync: switchNetworkWagmiAsync } = useSwitchChain()
  const { logout } = useAuth()
  const updateAccountState = useSetAtom(accountActiveChainAtom)
  const setSwitching = useSetAtom(switchChainUpdatingAtom)
  const lock = useRef(false)
  const router = useRouter()

  const activeChainIdRef = useActiveChainIdRef()
  const processSwitching = useCallback(async (request: SwitchChainRequest) => {
    const { from, wagmiConnector, evmAddress, replaceUrl, chainId: requestChainId, path } = request
    if (lock.current) {
      return false
    }
    // Need to switch
    lock.current = true
    try {
      setSwitching(true)
      if (isEvm(requestChainId)) {
        if (from !== 'wagmi') {
          // from = wagmi -> no need call switch again
          await switchNetworkWagmiAsync({ chainId: requestChainId })
        }
        updateAccountState((prev) => ({
          ...prev,
          chainId: requestChainId,
        }))
        if (replaceUrl) {
          const chain = getChainName(requestChainId)
          router.replace({ query: { ...router.query, chain } }, undefined, { shallow: true })
        }

        if (wagmiConnector && (await requireLogout(wagmiConnector, requestChainId, evmAddress))) {
          await logout()
        }
        return true
      }

      // Solana
      if (!SOLANA_SUPPORTED_PATH.includes(path)) {
        window.open('https://solana.pancakeswap.finance', '_self')
        return true
      }
      updateAccountState((prev) => ({
        ...prev,
        chainId: requestChainId,
      }))
      router.replace({ query: { ...router.query, chain: 'solana' } }, undefined, { shallow: true })
      return true
    } catch (error) {
      console.log(`[chain]`, 'switch error', error)
      return false
    } finally {
      setSwitching(false)
      setTimeout(() => {
        lock.current = false
      }, 60)
    }
  }, [])

  const handleRequestChainIdChange = useCallback(async (request: SwitchChainRequest) => {
    const { from, chainId: requestChainId } = request
    const activeChainId = activeChainIdRef.current

    // Check request chain ID && active Chain ID
    // For url type, wagmi state may not sync with the active chain ID
    if (requestChainId === activeChainId && from !== 'url') {
      // No need to switch
      return false
    }

    return processSwitching(request)
  }, [])

  return handleRequestChainIdChange
}
