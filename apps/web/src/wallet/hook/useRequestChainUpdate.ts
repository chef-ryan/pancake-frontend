import { getChainName, isEvm } from '@pancakeswap/chains'
import { useAtom, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import {
  SwitchChainRequest,
  switchChainRequestAtom,
  switchChainUpdatingAtom,
} from 'wallet/atoms/switchChainRequestAtom'
import { Connector, useSwitchChain } from 'wagmi'
import { accountActiveChainAtom } from 'wallet/atoms/accountStateAtoms'
import { useRouter } from 'next/router'
import { SOLANA_SUPPORTED_PATH } from 'wallet/solana.config'
import useAuth from 'hooks/useAuth'
import { useActiveChainIdRef } from 'hooks/useAccountActiveChain'

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

export const useRequestChainUpdate = () => {
  const { switchChainAsync: switchNetworkWagmiAsync } = useSwitchChain()
  const [request] = useAtom(switchChainRequestAtom)
  const router = useRouter()
  const { logout } = useAuth()
  const updateAccountState = useSetAtom(accountActiveChainAtom)
  const setSwitching = useSetAtom(switchChainUpdatingAtom)
  const lock = useRef(false)

  const activeChainIdRef = useActiveChainIdRef()
  const processSwitching = useCallback(async (request: SwitchChainRequest, path: string) => {
    const { from, wagmiConnector, evmAddress, replaceUrl, chainId: requestChainId } = request
    if (lock.current) {
      return
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
        return
      }

      // Solana
      if (!SOLANA_SUPPORTED_PATH.includes(path)) {
        window.open('https://solana.pancakeswap.finance', '_self')
      }
      updateAccountState((prev) => ({
        ...prev,
        chainId: requestChainId,
      }))
      router.replace({ query: { ...router.query, chain: 'solana' } }, undefined, { shallow: true })
    } finally {
      setSwitching(false)
      setTimeout(() => {
        lock.current = false
      }, 60)
    }
  }, [])

  const handleRequestChainIdChange = useCallback(
    async (request: SwitchChainRequest, path: string) => {
      const { from, replaceUrl, chainId: requestChainId } = request
      const activeChainId = activeChainIdRef.current

      // Check request chain ID && active Chain ID
      // For url type, wagmi state may not sync with the active chain ID
      if (requestChainId === activeChainId && from !== 'url') {
        // No need to switch
        return
      }

      processSwitching(request, path)
    },
    [router.pathname],
  )

  useEffect(() => {
    handleRequestChainIdChange(request, router.pathname)
  }, [request, router.pathname])
}
