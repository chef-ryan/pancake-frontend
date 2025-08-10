import { useMemo, useCallback } from 'react'

import BN from 'bignumber.js'
import { atom, useAtomValue } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { atomWithQuery } from 'jotai-tanstack-query'
import { useQueryClient } from '@tanstack/react-query'
import { TokenAccount } from '@pancakeswap/solana-core-sdk'
import { rpcUrlAtom } from '@pancakeswap/utils/user'
import { FAST_INTERVAL } from 'config/constants'

import { fetchSolanaTokenBalances } from './solanaBalanceFetcher'

const SOLANA_BALANCES_QUERY_KEY = 'solanaTokenBalances'

// Refresh counter per wallet address for triggering balance updates
export const solanaWalletBalanceRefreshCounterAtomFamily = atomFamily(() => atom(0))

const walletBalancesAtomFamily = atomFamily((walletAddress: string | null | undefined) =>
  atomWithQuery<Map<string, TokenAccount[]>, Error>((get) => {
    const rpc = get(rpcUrlAtom)
    return {
      queryKey: [SOLANA_BALANCES_QUERY_KEY, walletAddress, rpc],
      enabled: Boolean(walletAddress),
      queryFn: () => fetchSolanaTokenBalances(walletAddress!, rpc),
      refetchInterval: FAST_INTERVAL,
      initialData: () => new Map<string, TokenAccount[]>(),
    }
  }),
)

/**
 * useSolanaTokenBalance get a single token's balance for a wallet.
 * There is no need to cache the balance of a single token
 * because user want to see the latest balance as soon as possible.
 * This balance will be refetched every 10 seconds.
 */
export function useSolanaTokenBalance(
  walletAddress?: string | null,
  mintAddress?: string,
): { balance: BN; loading: boolean; error?: Error } {
  const { data, isLoading, error } = useAtomValue(walletBalancesAtomFamily(walletAddress))
  return useMemo(() => {
    if (!mintAddress) return { balance: new BN(0), loading: false }
    if (error) return { balance: new BN(0), loading: false, error }
    if (isLoading || !data) return { balance: new BN(0), loading: true }
    return { balance: new BN(data.get(mintAddress)?.[0].amount.toNumber() ?? 0), loading: false }
  }, [mintAddress, data, isLoading, error])
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
  const { data, isLoading, error } = useAtomValue(balancesAtom)
  return useMemo(() => {
    if (error) return { balances: new Map<string, BN>(), loading: false, error }
    if (isLoading || !data) return { balances: new Map<string, BN>(), loading: true }
    // If mintAddresses is provided, filter the map; otherwise, return all
    const filtered = new Map<string, BN>()
    if (mintAddresses && mintAddresses.length > 0) {
      mintAddresses.forEach((mint) => {
        filtered.set(mint, new BN(data.get(mint)?.[0].amount.toString() ?? 0))
      })
    } else {
      data.entries().forEach(([key]) => {
        filtered.set(key, new BN(data.get(key)?.[0].amount.toString() ?? 0))
      })
    }
    return { balances: filtered, loading: false }
  }, [mintAddresses, data, isLoading, error])
}

/**
 * Hook to trigger a manual refresh of Solana token balances.
 */
export function useRefreshSolanaTokenBalances(walletAddress?: string | null) {
  const queryClient = useQueryClient()
  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [SOLANA_BALANCES_QUERY_KEY, walletAddress], exact: false })
  }, [queryClient, walletAddress])
}
