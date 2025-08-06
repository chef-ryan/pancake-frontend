import { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { atomWithLoadable } from 'quoter/atom/atomWithLoadable'
import { DeepKeyMap, isEqual } from 'utils/hash'

import { WSOLMint } from '@pancakeswap/solana-core-sdk'
import { PublicKey } from '@solana/web3.js'

const WALLET_PRICE_URL = 'https://wallet-api.pancakeswap.com/sol/v1/prices/list'

type PriceReturnType = { [key: string]: number }

interface SolanaTokenPriceParams {
  mintList: string[]
  enabled: boolean
  version: number
}

const placeHolderMap = new DeepKeyMap<SolanaTokenPriceParams, PriceReturnType>()

const solanaTokenPriceAtom = atomFamily((params: SolanaTokenPriceParams) => {
  return atomWithLoadable(
    async () => {
      const { mintList, enabled } = params
      if (!enabled || mintList.length === 0) {
        return undefined
      }
      const response = await fetch(`${WALLET_PRICE_URL}/${mintList.join(',')}`)
      if (!response.ok) {
        throw new Error('Failed to fetch price')
      }
      const result: PriceReturnType = await response.json()
      result[PublicKey.default.toBase58()] = result[WSOLMint.toBase58()]
      placeHolderMap.set({ ...params, version: 0 }, result)
      return result
    },
    {
      placeHolderBehavior: 'stale',
      placeHolderValue: placeHolderMap.get({ ...params, version: 0 }),
    },
  )
}, isEqual)

export const useSolanaTokenPrice = (props: {
  mintList: (string | PublicKey | undefined)[]
  refreshInterval?: number
  timeout?: number
  enabled?: boolean
}) => {
  const { mintList, refreshInterval = 2 * 60 * 1000, enabled = true } = props || {}

  const readyList = useMemo(
    () => Array.from(new Set(mintList.filter((m): m is string => !!m && typeof m === 'string' && m.length === 44))),
    [mintList],
  )

  const version = Math.floor(Date.now() / refreshInterval)

  const loadable = useAtomValue(solanaTokenPriceAtom({ mintList: readyList, enabled, version }))

  const data = loadable.unwrapOr({})
  const error = loadable.isFail() ? loadable.error : undefined
  const isLoading = loadable.isPending()
  const isEmptyResult = loadable.isNothing()

  return {
    data,
    isLoading,
    error,
    isEmptyResult,
  }
}
