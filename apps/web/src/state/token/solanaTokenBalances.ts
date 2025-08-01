import { useMemo } from 'react'

import BN from 'bignumber.js'
import { atom, useAtomValue } from 'jotai'
import { atomFamily, loadable } from 'jotai/utils'
import { TokenAccount } from '@pancakeswap/solana-core-sdk'
import { rpcUrlAtom } from '@pancakeswap/utils/user'
import { useQuery } from '@tanstack/react-query'
import { FAST_INTERVAL } from 'config/constants'
import { PublicKey } from '@solana/web3.js'
import { useSolanaConnectionWithRpcAtom } from 'hooks/solana/useSolanaConnectionWithRpcAtom'
import { getAssociatedTokenAddress } from '@solana/spl-token-0.4'

import { fetchSolanaTokenBalances } from './solanaBalanceFetcher'

const NATIVE_SOLANA_MINT_ADDRESS = '11111111111111111111111111111111'

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
  const connection = useSolanaConnectionWithRpcAtom()

  const {
    data: balance,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['useSolanaTokenBalance', walletAddress, mintAddress],
    queryFn: async () => {
      if (!walletAddress || !mintAddress) return new BN(0)
      try {
        // handle native case
        if (mintAddress === NATIVE_SOLANA_MINT_ADDRESS) {
          const balance = await connection.getBalance(new PublicKey(walletAddress))
          return new BN(balance.toString())
        }

        const mintPub = new PublicKey(mintAddress)
        const owner = new PublicKey(walletAddress)

        // TODO: can cache this ATA address
        const ata = await getAssociatedTokenAddress(mintPub, owner)

        const balance = await connection.getTokenAccountBalance(ata)

        return new BN(balance.value.amount.toString())
      } catch (error) {
        console.error(error)
        return new BN(0)
      }
    },
    enabled: Boolean(walletAddress && mintAddress),
    staleTime: FAST_INTERVAL,
    refetchOnWindowFocus: false,
    refetchInterval: FAST_INTERVAL,
  })

  return useMemo(() => {
    return {
      balance: balance ?? new BN(0),
      loading: isLoading,
      error: error as Error,
    }
  }, [balance, isLoading, error])
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
