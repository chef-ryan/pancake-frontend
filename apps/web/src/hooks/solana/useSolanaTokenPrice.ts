import { useMemo } from 'react'

import useSWR, { Fetcher } from 'swr'

import { WSOLMint } from '@pancakeswap/solana-core-sdk'
import { PublicKey } from '@solana/web3.js'

const WALLET_PRICE_URL = 'https://wallet-api.pancakeswap.com/sol/v1/prices/list'

type PriceReturnType = { [key: string]: number }

const fetcher: Fetcher<PriceReturnType, [string, string]> = async ([url, mintList]: [string, string]) => {
  const response = await fetch(`${url}/${mintList}`)
  if (!response.ok) throw new Error('Failed to fetch price')
  return response.json()
}

export const useSolanaTokenPrice = (props: {
  mintList: (string | PublicKey | undefined)[]
  refreshInterval?: number
  timeout?: number
  enabled?: boolean
}) => {
  const { mintList, refreshInterval = 2 * 60 * 1000, enabled = true } = props || {}

  const readyList = useMemo(
    () => Array.from(new Set(mintList.filter((m) => !!m && typeof m === 'string' && m.length === 44))),
    [mintList],
  )

  const shouldFetch = readyList.length > 0 && enabled

  const { data, isLoading, error, ...rest } = useSWR(
    shouldFetch ? [WALLET_PRICE_URL, readyList.join(',')] : null,
    fetcher,
    {
      refreshInterval,
      dedupingInterval: refreshInterval,
      focusThrottleInterval: refreshInterval,
    },
  )
  const isEmptyResult = !isLoading && !(data && !error)

  if (data) {
    data[PublicKey.default.toBase58()] = data[WSOLMint.toBase58()]
  }

  return {
    data: data ?? {},
    isLoading,
    error,
    isEmptyResult,
    ...rest,
  }
}
