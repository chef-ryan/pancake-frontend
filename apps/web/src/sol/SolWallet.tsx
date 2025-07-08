import { useTranslation } from '@pancakeswap/localization'
import { WalletConfigV2, WalletIds, WalletModalV2 } from '@pancakeswap/ui-wallets'
import { Button } from '@pancakeswap/uikit'
import { WalletName } from '@solana/wallet-adapter-base'
import { useWallet } from '@solana/wallet-adapter-react'
import { FC, useCallback, useMemo, useState } from 'react'

export enum ConnectorNames {
  Phantom = 'Phantom',
  Solflare = 'Solflare',
}

const walletsConfig: WalletConfigV2<ConnectorNames>[] = [
  {
    id: WalletIds.Metamask as WalletIds,
    title: 'Phantom',
    icon: 'https://pancakeswap.finance/images/wallets/phantom.png',
    get installed() {
      return typeof window !== 'undefined' && !!(window as any).solana?.isPhantom
    },
    connectorId: ConnectorNames.Phantom,
    downloadLink: 'https://phantom.app/',
  },
  {
    id: WalletIds.Blocto as WalletIds,
    title: 'Solflare',
    icon: 'https://pancakeswap.finance/images/wallets/solflare.png',
    get installed() {
      return typeof window !== 'undefined' && !!(window as any).solflare
    },
    connectorId: ConnectorNames.Solflare,
    downloadLink: 'https://solflare.com/download',
  },
]

const topWallets = walletsConfig

export const SolWallet: FC = () => {
  const { t } = useTranslation()
  const { select, connect, disconnect, connected, publicKey } = useWallet()
  const [open, setOpen] = useState(false)

  const login = useCallback(
    async (id: ConnectorNames) => {
      select(id as WalletName)
      try {
        await connect()
        const account = publicKey ? publicKey.toBase58() : ''
        // Always return a tuple with at least one string
        return { accounts: [account] as [string, ...string[]], chainId: 'solana' }
      } catch (error) {
        console.error(error)
        return undefined
      }
    },
    [connect, select, publicKey],
  )

  const accountText = useMemo(() => {
    const account = publicKey?.toBase58()
    return account ? `${account.substring(0, 2)}...${account.substring(account.length - 2)}` : null
  }, [publicKey])

  return (
    <>
      {connected ? (
        <Button scale="sm" onClick={disconnect}>
          {accountText}
        </Button>
      ) : (
        <Button scale="sm" onClick={() => setOpen(true)}>
          {t('Connect')}
        </Button>
      )}
      <WalletModalV2
        isOpen={open}
        onDismiss={() => setOpen(false)}
        wallets={walletsConfig}
        topWallets={topWallets}
        login={login}
        mevDocLink={null}
        docLink="https://docs.pancakeswap.finance/get-started/wallet-guide"
        docText={t('Learn How to Create and Connect')}
      />
    </>
  )
}
