import { useMemo, useCallback } from 'react'

import BN from 'bignumber.js'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { atomFamily, loadable } from 'jotai/utils'
import { TokenAccount } from '@pancakeswap/solana-core-sdk'
import { rpcUrlAtom } from '@pancakeswap/utils/user'

import { fetchSolanaTokenBalances } from './solanaBalanceFetcher'

// Refresh counter per wallet address for triggering balance updates
export const solanaWalletBalanceRefreshCounterAtomFamily = atomFamily(() => atom(0))

/**
 * AtomFamily that uses Jotai's dependency tracking with refresh capability.
 * This atom family will re-fetch when refresh counter or RPC URL changes.
 */
const walletBalancesAtomFamily = atomFamily((walletAddress: string | null | undefined) =>
  loadable(
    atom(async (get) => {
      if (!walletAddress) return new Map<string, TokenAccount[]>()

      // Add dependency on wallet-specific refresh counter to trigger updates
      get(solanaWalletBalanceRefreshCounterAtomFamily(walletAddress))

      const rpc = get(rpcUrlAtom)
      return fetchSolanaTokenBalances(walletAddress, rpc)
    }),
  ),
)

/**
 * useSolanaTokenBalance get a single token's balance for a wallet.
 * There is no need to cache the balance of a single token
 * because user want to see the latest balance as soon as possible.
 * This balance will be refetched every 10 seconds.
 *
 * NOTE:
 * If we want to use atom in the future, consider using atomWithQuery extension
 */
export function useSolanaTokenBalance(
  walletAddress?: string | null,
  mintAddress?: string,
): { balance: BN; loading: boolean; error?: Error } {
  const state = useAtomValue(walletBalancesAtomFamily(walletAddress))
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

/**
 * Hook to trigger a manual refresh of Solana token balances.
 * It simply increments the global refresh counter, causing
 * any atoms that depend on it to re-fetch balances.
 */
export function useRefreshSolanaTokenBalances(walletAddress?: string | null) {
  const setCounter = useSetAtom(solanaWalletBalanceRefreshCounterAtomFamily(walletAddress ?? null))

  return useCallback(() => {
    setCounter((c) => c + 1)
  }, [setCounter])
}
