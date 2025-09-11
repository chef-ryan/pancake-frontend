import { useEffect, useMemo, useRef, useState } from 'react'
import { Raydium } from '@pancakeswap/solana-core-sdk'
import { useWallet } from '@solana/wallet-adapter-react'
import { urlConfigs } from 'config/constants/endpoints'

import { useSolanaConnectionWithRpcAtom } from './useSolanaConnectionWithRpcAtom'

/**
 * Returns an async factory that loads a Raydium client with the current
 * connection, owner, and a signAllTransactions function wired to the
 * connected wallet adapter.
 */
export function useRaydiumClient() {
  const connection = useSolanaConnectionWithRpcAtom()
  const { publicKey, signAllTransactions, signTransaction } = useWallet()
  const cacheRef = useRef<{
    rpc?: string
    owner?: string
    client?: Raydium
  }>({})
  const [client, setClient] = useState<Raydium | undefined>(undefined)

  const rpc = (connection as any)?.rpcEndpoint || (connection as any)?._rpcEndpoint
  const owner = publicKey?.toBase58()

  // Build or reuse client when rpc/owner changes
  useEffect(() => {
    let cancelled = false
    async function ensureClient() {
      if (!publicKey) {
        setClient(undefined)
        return
      }
      if (cacheRef.current.client && cacheRef.current.rpc === rpc && cacheRef.current.owner === owner) {
        setClient(cacheRef.current.client)
        return
      }
      const raydium = await Raydium.load({ connection, owner: publicKey, urlConfigs, disableFeatureCheck: true })
      if (cancelled) return
      cacheRef.current = { rpc, owner: owner!, client: raydium }
      setClient(raydium)
    }
    ensureClient()
    return () => {
      cancelled = true
    }
  }, [connection, publicKey, rpc, owner])

  // Always refresh signing adapter on render changes
  useEffect(() => {
    if (!client) return
    client.setSignAllTransactions(async (txs) => {
      if (signAllTransactions) return signAllTransactions(txs as any)
      if (signTransaction) {
        const out: any[] = []
        // eslint-disable-next-line no-restricted-syntax
        for (const tx of txs as any[]) {
          // eslint-disable-next-line no-await-in-loop
          out.push(await signTransaction(tx))
        }
        return out as any
      }
      throw new Error('Wallet does not support signing transactions')
    })
  }, [client, signAllTransactions, signTransaction])

  return client
}
