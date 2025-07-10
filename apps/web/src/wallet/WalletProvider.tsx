import { isInBinance } from '@binance/w3w-utils'
import { useSyncWalletState } from 'hooks/useAccountActiveChain'
import { useEffect, useMemo, useState } from 'react'
import { createW3WWagmiConfig, createWagmiConfig } from 'utils/wagmi'
import { WagmiProvider } from 'wagmi'
import { W3WConfigProvider } from './W3WConfigContext'

interface WalletProviderProps {
  reconnectOnMount?: boolean
  children?: React.ReactNode
}

export const eip6963Providers: any[] = []

export const WalletProvider = (props: WalletProviderProps) => {
  const { children } = props
  const [ready, setReady] = useState(false)
  const wagmiConfig = useMemo(
    () => (typeof window !== 'undefined' && isInBinance() ? createW3WWagmiConfig() : createWagmiConfig()),
    [ready],
  )

  useEffect(() => {
    window.addEventListener('eip6963:announceProvider', (event: any) => {
      const { provider } = event.detail
      eip6963Providers.push(provider)
    })
    window.dispatchEvent(new Event('eip6963:requestProvider'))
    setTimeout(() => {
      setReady(true)
    })
  }, [])
  if (!ready) {
    return null // or a loading spinner
  }

  return (
    <WagmiProvider reconnectOnMount config={wagmiConfig}>
      <W3WConfigProvider value={isInBinance()}>
        <Sync />
        {children}
      </W3WConfigProvider>
    </WagmiProvider>
  )
}

const Sync = () => {
  useSyncWalletState()
  return null
}
