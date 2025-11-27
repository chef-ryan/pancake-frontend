import { useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { initialize } from '@solflare-wallet/wallet-adapter'
import { useSetAtom } from 'jotai'
import safeGetWindow from '@pancakeswap/utils/safeGetWindow'
import { accountActiveChainAtom } from './atoms/accountStateAtoms'

initialize()

export const SolanaWalletStateUpdater = () => {
  const { connected, connecting, publicKey, disconnect } = useWallet()
  const setWalletState = useSetAtom(accountActiveChainAtom)

  useEffect(() => {
    const solanaAccount = publicKey?.toBase58() || null
    setWalletState((prev) => {
      return { ...prev, solanaAccount }
    })
  }, [connected, connecting, publicKey, setWalletState])

  useEffect(() => {
    const trustWallet = window?.trustwallet?.solana
    if (!trustWallet) return undefined

    if (typeof trustWallet.on !== 'function' || typeof trustWallet.off !== 'function') {
      console.warn('[TW] Provider does not support .on/.off — skipping listener binding')
      return undefined
    }

    let listenersAttached = false

    const handleAccountChange = async (newAccount: any) => {
      const accountStr = newAccount?.toBase58?.() || null
      console.info(`[TW] accountChanged → ${accountStr || 'null'} (forcing reload)`)
      await disconnect()
      safeGetWindow()?.location.reload()
    }

    const handleDisconnect = () => {
      console.info('[TW] Wallet disconnected — removing listeners')

      trustWallet.off('accountChanged', handleAccountChange)
      trustWallet.off('disconnect', handleDisconnect)

      listenersAttached = false
    }

    const attachListeners = () => {
      if (listenersAttached) {
        console.info('[TW] Listener attach skipped — already attached')
        return
      }

      console.info('[TW] Attaching accountChanged + disconnect listeners')

      trustWallet.on('accountChanged', handleAccountChange)
      trustWallet.on('disconnect', handleDisconnect)

      listenersAttached = true
    }

    const handleConnect = () => {
      console.info('[TW] connect event fired — attaching listeners')
      attachListeners()
    }

    trustWallet.on('connect', handleConnect)

    return () => {
      console.info('[TW] Cleaning up TrustWallet listeners')

      trustWallet.off('connect', handleConnect)
      trustWallet.off('accountChanged', handleAccountChange)
      trustWallet.off('disconnect', handleDisconnect)
    }
  }, [disconnect])

  return null
}
