import '@pancakeswap/jupiter-terminal/global.css'
import '@pancakeswap/jupiter-terminal/index.css'

import styled from 'styled-components'
import { AtomBox } from '@pancakeswap/uikit'
import { useCallback, useEffect } from 'react'
import { init, syncProps } from '@pancakeswap/jupiter-terminal'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { TerminalCard, TerminalWrapper } from '@/features/JupiterSwap/SwapForm'
import { logGTMSwapTXSuccessEvent, logGTMWalletConnectedEvent } from '@/utils/report/curstomGTMEventTracking'
import { logDDSwapTXSuccessEvent, logDDWalletConnectedEvent } from '@/utils/report/datadog'
import { colors } from '@/theme/cssVariables'
import useResponsive from '@/hooks/useResponsive'

const TARGET_ELE_ID = 'integrated-terminal'

const SwapPage = styled(AtomBox)`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  padding: 16px;
  padding-bottom: 0;
  background: ${colors.gradientBubblegum};
  background-size: auto;
`

const JupiterTerminal = () => {
  const { isMobile } = useResponsive()
  const { connection } = useConnection()
  const passthroughWalletContextState = useWallet()
  const { setVisible } = useWalletModal()

  useEffect(() => {
    if (passthroughWalletContextState.wallet?.adapter.connected) {
      const walletName = passthroughWalletContextState.wallet?.adapter.name
      logGTMWalletConnectedEvent(walletName)
      logDDWalletConnectedEvent(walletName)
    }
  }, [passthroughWalletContextState.wallet?.adapter.connected, passthroughWalletContextState.wallet?.adapter.name])

  const logSwapSucc = useCallback(
    ({ txid }: { txid: string }) => {
      const info = {
        txId: txid,
        from: passthroughWalletContextState.wallet?.adapter.publicKey?.toBase58(),
        chain: 'solana'
      }
      // GTM
      logGTMSwapTXSuccessEvent(info)
      // DD
      logDDSwapTXSuccessEvent(info)
    },
    [passthroughWalletContextState.wallet?.adapter.publicKey]
  )

  useEffect(() => {
    init({
      displayMode: 'integrated',
      integratedTargetId: TARGET_ELE_ID,
      endpoint: connection.rpcEndpoint,
      refetchIntervalForTokenAccounts: 60000,
      containerStyles: {
        maxWidth: '480px',
        overflow: 'hidden'
      },
      enableWalletPassthrough: true,
      onRequestConnectWallet: () => setVisible(true),
      onSuccess(result) {
        logSwapSucc(result)
      }
    })
  }, [setVisible, logSwapSucc, connection.rpcEndpoint])

  // Do not pass the passthroughWalletContextState into init.
  // Otherwise, the entire widget will refresh when the theme switches.
  useEffect(() => {
    syncProps({
      enableWalletPassthrough: true,
      passthroughWalletContextState
    })
  }, [passthroughWalletContextState])

  return (
    <SwapPage justifyContent={['flex-start', 'center']}>
      <TerminalWrapper style={{ marginTop: isMobile ? '24px' : '-70px' }}>
        <TerminalCard>
          <div id={TARGET_ELE_ID} />
        </TerminalCard>
      </TerminalWrapper>
    </SwapPage>
  )
}

export default JupiterTerminal
