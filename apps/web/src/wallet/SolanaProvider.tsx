import { FC, PropsWithChildren, useEffect, useMemo } from 'react'

import { type Adapter, type WalletError } from '@solana/wallet-adapter-base'
import { ExodusWalletAdapter } from '@solana/wallet-adapter-exodus'
import { GlowWalletAdapter } from '@solana/wallet-adapter-glow'
import { ConnectionProvider, useWallet, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { SlopeWalletAdapter } from '@solana/wallet-adapter-slope'
import {
  BitgetWalletAdapter,
  BitpieWalletAdapter,
  Coin98WalletAdapter,
  CoinbaseWalletAdapter,
  MathWalletAdapter,
  PhantomWalletAdapter,
  SafePalWalletAdapter,
  SolongWalletAdapter,
  TokenPocketWalletAdapter,
  TrustWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { initialize, SolflareWalletAdapter } from '@solflare-wallet/wallet-adapter'
import { WalletConnectWalletAdapter } from '@walletconnect/solana-adapter'

import { useAtomValue, useSetAtom } from 'jotai'
import { rpcUrlAtom } from '@pancakeswap/utils/user'
import { defaultNetWork } from './solana.config'
import { BackpackWalletAdapter } from './walletAdapter/BackpackWalletAdapter'
import { OKXWalletAdapter } from './walletAdapter/OKXWalletAdapter'
import { accountActiveChainAtom } from './atoms/accountStateAtoms'

initialize()

const SolanaWalletStateUpdater = () => {
  const { connected, connecting, publicKey } = useWallet()
  const setWalletState = useSetAtom(accountActiveChainAtom)

  useEffect(() => {
    const solanaAccount = publicKey?.toBase58() || null
    setWalletState((prev) => {
      return { ...prev, solanaAccount }
    })
  }, [connected, connecting, publicKey, setWalletState])

  return null
}
export const SolanaProvider: FC<PropsWithChildren<any>> = ({ children }) => {
  const endpoint = useAtomValue(rpcUrlAtom)
  const _walletConnect = useMemo(() => {
    const connectWallet: WalletConnectWalletAdapter[] = []
    try {
      connectWallet.push(
        new WalletConnectWalletAdapter({
          network: defaultNetWork,
          options: {
            projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PJ_ID,
            metadata: {
              name: 'PancakeSwap',
              description: 'Trade, earn, and own crypto on the all-in-one multichain DEX',
              url: 'https://solana.pancakeswap.finance/swap',
              icons: ['https://pancakeswap.finance/favicon.ico'],
            },
          },
        }),
      )
    } catch (e) {
      // console.error('WalletConnect error', e)
    }
    return connectWallet
  }, [])

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new SlopeWalletAdapter({ endpoint }),
      ..._walletConnect,
      new GlowWalletAdapter(),
      new TrustWalletAdapter(),
      new MathWalletAdapter({ endpoint }),
      new TokenPocketWalletAdapter(),
      new CoinbaseWalletAdapter({ endpoint }),
      new SolongWalletAdapter({ endpoint }),
      new Coin98WalletAdapter({ endpoint }),
      new SafePalWalletAdapter({ endpoint }),
      new BitpieWalletAdapter({ endpoint }),
      new BitgetWalletAdapter({ endpoint }),
      new ExodusWalletAdapter({ endpoint }),
      new OKXWalletAdapter(),
      new BackpackWalletAdapter(),
    ],
    [endpoint, _walletConnect],
  )

  const onWalletError = (error: WalletError, adapter?: Adapter) => {
    // if (!adapter) return
  }

  return (
    <ConnectionProvider endpoint={endpoint} config={{ disableRetryOnRateLimit: true }}>
      <WalletProvider wallets={wallets} onError={onWalletError} autoConnect>
        <SolanaWalletStateUpdater />
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
