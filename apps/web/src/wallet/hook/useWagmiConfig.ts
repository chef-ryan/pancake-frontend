import { isInBinance } from '@binance/w3w-utils'
import { useEffect } from 'react'
import { createW3WWagmiConfig, createWagmiConfig } from 'utils/wagmi'
import { eip6963Providers } from 'wallet/WalletProvider'
import { atom, useAtom } from 'jotai'
import { useAccountEffect } from 'wagmi'

export const wagmiConfigAtom = atom<any>(undefined)
export const useWagmiConfig = () => {
  const [wagmiConfig, setWagmiConfig] = useAtom(wagmiConfigAtom)

  useEffect(() => {
    window.addEventListener('eip6963:announceProvider', (event: any) => {
      const { provider } = event.detail
      eip6963Providers.push(provider)
    })
    window.dispatchEvent(new Event('eip6963:requestProvider'))
    setTimeout(() => {
      setWagmiConfig(typeof window !== 'undefined' && isInBinance() ? createW3WWagmiConfig() : createWagmiConfig())
    })
  }, [])

  return wagmiConfig
}
