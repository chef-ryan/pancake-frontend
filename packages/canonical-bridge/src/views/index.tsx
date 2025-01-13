import { useTranslation } from '@pancakeswap/localization'
import { Flex, useToast } from '@pancakeswap/uikit'
import { useCallback, useEffect, useMemo } from 'react'

import {
  BridgeRoutes,
  BridgeTransfer,
  CanonicalBridgeProvider,
  CanonicalBridgeProviderProps,
  ICanonicalBridgeConfig,
} from '@bnb-chain/canonical-bridge-widget'
import { useTheme } from 'styled-components'
import { useAccount } from 'wagmi'
import { useLastUpdated } from '@pancakeswap/hooks'
import { RefreshingIcon } from '../components/RefreshingIcon'
import { V1BridgeLink } from '../components/V1BridgeLink'
import { chains, env } from '../configs'
import { useTransferConfig } from '../hooks/useTransferConfig'
import { locales } from '../modules/i18n/locales'
import { BridgeWalletProvider } from '../modules/wallet/BridgeWalletProvider'
import { breakpoints } from '../theme/breakpoints'
import { dark } from '../theme/dark'
import { light } from '../theme/light'
import GlobalStyle from './GlobalStyle'

export interface CanonicalBridgeProps {
  connectWalletButton: CanonicalBridgeProviderProps['connectWalletButton']
  supportedChainIds: number[]
  rpcConfig: Record<number, string[]>
  v1LinkText: string
}

export const CanonicalBridge = (props: CanonicalBridgeProps) => {
  const { connectWalletButton, supportedChainIds, v1LinkText } = props

  const transferConfig = useTransferConfig()
  const { currentLanguage } = useTranslation()
  const theme = useTheme()
  const toast = useToast()
  const { setLastUpdated: refresh } = useLastUpdated()

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const inputElement = document.querySelector('.bccb-widget-transfer-input') as HTMLInputElement | null
      if (inputElement) {
        inputElement.setAttribute('pattern', '^[0-9]*[.,]?[0-9]*$')

        const handlePaste = (e: ClipboardEvent) => {
          const pastedValue = e?.clipboardData?.getData('Text')

          if (!pastedValue || !/^[0-9]*[.,]?[0-9]*$/.test(pastedValue)) {
            e.preventDefault()
          }
        }

        inputElement.addEventListener('paste', handlePaste)
        refresh()

        return () => {
          inputElement.removeEventListener('paste', handlePaste)
        }
      }
    }
    return undefined
  }, [refresh])

  const config = useMemo<ICanonicalBridgeConfig>(
    () => ({
      appName: 'canonical-bridge',
      assetPrefix: env.ASSET_PREFIX,
      appearance: {
        bridgeTitle: 'Bridge',
        colorMode: theme.isDark ? 'dark' : 'light',
        theme: {
          dark,
          light,
          breakpoints,
        },
        locale: currentLanguage.code,
        messages: locales[currentLanguage.code] ?? locales.en,
      },
      http: {
        apiTimeOut: 30 * 1000,
        serverEndpoint: env.SERVER_ENDPOINT,
      },
    }),
    [currentLanguage.code, theme.isDark],
  )

  const { connector } = useAccount()
  const supportedChains = useMemo(() => {
    return chains
      .filter((e) => supportedChainIds.includes(e.id))
      .filter((e) => !(connector?.id === 'BinanceW3WSDK' && e.id === 1101))
      .map((chain) => ({ ...chain, rpcUrl: props.rpcConfig?.[chain.id]?.[0] ?? chain.rpcUrl }))
  }, [supportedChainIds, connector?.id, props.rpcConfig])

  const handleError = useCallback(
    (params: { type: string; message?: string | undefined; error?: Error | undefined }) => {
      if (params.message) {
        toast.toastError(params.message)
      }
    },
    [toast],
  )

  return (
    <BridgeWalletProvider>
      <GlobalStyle />
      <CanonicalBridgeProvider
        config={config}
        transferConfig={transferConfig}
        chains={supportedChains}
        connectWalletButton={connectWalletButton}
        refreshingIcon={<RefreshingIcon />}
        onError={handleError}
      >
        <Flex flexDirection="column" justifyContent="center" maxWidth="480px" width="100%">
          <BridgeTransfer />
          <V1BridgeLink v1LinkText={v1LinkText} />
        </Flex>
        <BridgeRoutes />
      </CanonicalBridgeProvider>
    </BridgeWalletProvider>
  )
}
