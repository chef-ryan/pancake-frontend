import { useAtomValue } from 'jotai'
import { useSolanaTokenList } from 'hooks/useSolanaTokenList'
import { useMemo } from 'react'
import {
  getMultipleAccountsInfo,
  getPdaPersonalPositionAddress,
  PositionInfoLayout,
  TokenAccount,
} from '@pancakeswap/solana-core-sdk'
import BN from 'bn.js'
import { useQuery } from '@tanstack/react-query'
import { Connection, PublicKey } from '@solana/web3.js'
import { rpcUrlAtom } from '@pancakeswap/utils/user'
import memoize from '@pancakeswap/utils/memoize'
import { walletBalancesAtomFamily } from './atomFamily'

export const useSolanaPositionNFTsByAccount = (walletAddress?: string | null) => {
  const { data, isLoading } = useAtomValue(walletBalancesAtomFamily(walletAddress))
  const { tokenList } = useSolanaTokenList()

  return useMemo(() => {
    if (isLoading || !data) return []

    const d = Array.from(data.values())
      .flat()
      .filter((token: TokenAccount) => {
        return token.amount.eq(new BN(1)) && !tokenList.some((t) => t.address === token.mint.toBase58())
      })

    return d
  }, [data, isLoading, tokenList])
}

const solanaPositionInfoFetcher = async (rpc: string, addresses: string[]) => {
  const connection = new Connection(rpc)

  const res = await getMultipleAccountsInfo(
    connection,
    addresses.map((mint) => new PublicKey(mint)),
    { batchRequest: true },
  )

  return res
    .flat()
    .map((info) => {
      if (!info) return null
      return PositionInfoLayout.decode(info.data)
    })
    .filter((info) => !!info)
}

const pdaCacheMap = new Map<string, string>()

const getSolanaPositionMints = memoize((nfts: TokenAccount[]) => {
  return nfts.map((nft) => {
    const key = `${nft.mint.toBase58()}-${nft.programId.toBase58()}`
    if (pdaCacheMap.get(key)) return pdaCacheMap.get(key)!
    const pda = getPdaPersonalPositionAddress(new PublicKey(nft.programId), new PublicKey(nft.mint.toBase58()))
    pdaCacheMap.set(key, pda.publicKey.toBase58())
    return pda.publicKey.toBase58()
  })
})

export const useSolanaPositionsInfoByAccount = (walletAddress?: string | null) => {
  const nfts = useSolanaPositionNFTsByAccount(walletAddress)
  const rpc = useAtomValue(rpcUrlAtom)

  return useQuery({
    queryKey: ['solana-position-info', walletAddress],
    queryFn: () => solanaPositionInfoFetcher(rpc, getSolanaPositionMints(nfts)),
  })
}
