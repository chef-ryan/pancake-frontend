import { useMemo } from 'react'

import BN from 'bignumber.js'
import { atom, useAtomValue } from 'jotai'
import { atomFamily, loadable } from 'jotai/utils'
import { TokenAccount } from '@pancakeswap/solana-core-sdk'
import { rpcUrlAtom } from '@pancakeswap/utils/user'

import { fetchSolanaTokenBalances } from './solanaBalanceFetcher'

/**
 * AtomFamily: caches all token balances for a wallet.
 * The value is a Map<string, BN> where key is mint address.
 */
const walletBalancesAtomFamily = atomFamily((walletAddress: string | null | undefined) =>
  loadable(
    atom(async (get) => {
      if (!walletAddress) return new Map<string, TokenAccount[]>()
      const rpc = get(rpcUrlAtom)
      return fetchSolanaTokenBalances(walletAddress, rpc)
    }),
  ),
)

/**
 * Hook: get a single token's balance for a wallet.
 * Reuses the walletBalancesAtomFamily cache.
 */
export function useSolanaTokenBalance(
  walletAddress?: string | null,
  mintAddress?: string,
): { balance: BN; loading: boolean; error?: Error } {
  const balancesAtom = useMemo(() => walletBalancesAtomFamily(walletAddress ?? null), [walletAddress])
  const state = useAtomValue(balancesAtom)
  return useMemo(() => {
    if (!mintAddress) return { balance: new BN(0), loading: false }
    if (state.state === 'hasError') return { balance: new BN(0), loading: false, error: state.error as Error }
    if (state.state === 'loading') return { balance: new BN(0), loading: true }
    return { balance: new BN(state.data.get(mintAddress)?.[0].amount.toNumber() ?? 0), loading: false }
  }, [mintAddress, state])
}

/**
 * Hook: get balances for a set of tokens for a wallet.
 * Reuses the walletBalancesAtomFamily cache.
 */
export function useSolanaTokenBalances(
  walletAddress?: string | null,
  mintAddresses?: string[],
): { balances: Map<string, BN>; loading: boolean } {
  const balancesAtom = useMemo(() => walletBalancesAtomFamily(walletAddress ?? null), [walletAddress])
  const state = useAtomValue(balancesAtom)
  return useMemo(() => {
    if (state.state === 'hasError')
      return { balances: new Map<string, BN>(), loading: false, error: state.error as Error }
    if (state.state === 'loading') return { balances: new Map<string, BN>(), loading: true }
    // If mintAddresses is provided, filter the map; otherwise, return all
    const filtered = new Map<string, BN>()
    if (mintAddresses && mintAddresses.length > 0) {
      mintAddresses.forEach((mint) => {
        filtered.set(mint, new BN(state.data.get(mint)?.[0].amount.toString() ?? 0))
      })
    } else {
      state.data.entries().forEach(([key]) => {
        filtered.set(key, new BN(state.data.get(key)?.[0].amount.toString() ?? 0))
      })
    }
    return { balances: filtered, loading: false }
  }, [mintAddresses, state])
}
