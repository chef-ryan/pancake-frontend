import { CanonicalBridge, useChainFromWidget } from '@pancakeswap/canonical-bridge'
import { ChainId, chainNameToChainId, chainNames, NonEVMChainId } from '@pancakeswap/chains'
import { Flex, useMatchBreakpoints } from '@pancakeswap/uikit'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { PUBLIC_NODES } from 'config/nodes'
import { Suspense, useEffect, useMemo } from 'react'
import { CHAIN_IDS } from 'utils/wagmi'
import Page from 'views/Page'
import SolanaConnectButton from 'wallet/components/SolanaConnectButton'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { useSwitchNetworkLocal } from 'hooks/useSwitchNetwork'

const DISABLED_TO_CHAINS = [ChainId.POLYGON_ZKEVM]

// Fix portal conflicts between Privy and Chakra portals
function usePortalConflictFix() {
  useEffect(() => {
    const handlePortalConflict = () => {
      // Check for both portals existing
      const headlessuiPortals = document.querySelectorAll('[id*="headlessui-portal-root"]')
      const chakraPortals = document.querySelectorAll('[class*="chakra-portal"]')

      if (headlessuiPortals.length > 0 && chakraPortals.length > 0) {
        // Temporarily hide chakra portals when headlessui modal is active
        chakraPortals.forEach((portal) => {
          const portalElement = portal as HTMLElement
          portalElement.style.visibility = 'hidden'
        })

        // Restore visibility when headlessui portal is removed
        const observer = new MutationObserver(() => {
          const remainingHeadlessuiPortals = document.querySelectorAll('[id*="headlessui-portal-root"]')
          if (remainingHeadlessuiPortals.length === 0) {
            chakraPortals.forEach((portal) => {
              const portalElement = portal as HTMLElement
              portalElement.style.visibility = 'visible'
            })
          }
        })

        observer.observe(document.body, { childList: true, subtree: true })

        return () => observer.disconnect()
      }

      return undefined
    }

    // Monitor for portal creation
    const portalObserver = new MutationObserver(handlePortalConflict)
    portalObserver.observe(document.body, { childList: true, subtree: true })

    // Also check immediately
    handlePortalConflict()

    return () => {
      portalObserver.disconnect()
    }
  }, [])
}

const BridgeChainSync = () => {
  const fromChain = useChainFromWidget('from')
  const switchNetworkLocal = useSwitchNetworkLocal()
  const { chainId: activeChainId } = useActiveChainId()

  useEffect(() => {
    const chainId = fromChain ? chainNameToChainId[fromChain] : undefined
    if (chainId && chainId !== activeChainId) {
      switchNetworkLocal(chainId)
    }
  }, [fromChain, switchNetworkLocal, activeChainId])

  return null
}

export const BridgeView = () => {
  const { isMobile } = useMatchBreakpoints()

  // Fix portal conflicts on this page
  usePortalConflictFix()

  return (
    <Page removePadding hideFooterOnDesktop={false} showExternalLink={false} showHelpLink={false} noMinHeight>
      <Flex
        width="100%"
        height="100%"
        justifyContent="center"
        position="relative"
        px={isMobile ? '16px' : '24px'}
        pb={isMobile ? '14px' : '48px'}
        pt={isMobile ? '24px' : '64px'}
        alignItems="flex-start"
        max-width="unset"
      >
        <Suspense>
          <CanonicalBridge
            connectWalletButtons={useMemo(
              () => ({
                default: <ConnectWalletButton width="100%" />,
                [chainNames[NonEVMChainId.SOLANA]]: <SolanaConnectButton width="100%" />,
              }),
              [],
            )}
            supportedChainIds={CHAIN_IDS}
            rpcConfig={PUBLIC_NODES}
            disabledToChains={DISABLED_TO_CHAINS}
          />
        </Suspense>
      </Flex>
      <BridgeChainSync />
    </Page>
  )
}
