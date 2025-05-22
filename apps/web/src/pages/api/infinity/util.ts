import { ChainId } from '@pancakeswap/chains'
import { INFINITY_SUPPORTED_CHAINS } from '@pancakeswap/infinity-sdk'
import { OnChainProvider, SmartRouter } from '@pancakeswap/smart-router'
import { NextResponse } from 'next/server'
import qs from 'qs'
import { checksumAddress } from 'utils/checksumAddress'
import { getViemClients } from 'utils/viem.server'
import { Address } from 'viem/accounts'

export type Protocol = 'v2' | 'ss' | 'v3' | 'infinity'

export const ALLOWED_PROTOCOLS = ['v2', 'ss', 'v3', 'infinity']

// This is only for get pools, because get pools dont require symbol and decimals
export const mockCurrency = (address: Address, chainId: ChainId) => {
  return SmartRouter.Transformer.parseCurrency(chainId, {
    address,
    decimals: 18,
    symbol: '',
  })
}

export const getProvider = () => {
  return getViemClients as OnChainProvider
}

const MAX_CACHE_SECONDS = 10
export const responseJson = (val: any, extra?: any) => {
  return NextResponse.json(
    {
      data: val,
      lastUpdated: Number(Date.now()),
      ...extra,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': `max-age=${MAX_CACHE_SECONDS}, s-maxage=${MAX_CACHE_SECONDS}`,
        'Content-Type': 'application/json',
      },
    },
  )
}

export function parseCandidatesQuery(raw: string) {
  if (!raw) {
    throw new Error('Invalid query')
  }
  const queryParsed = qs.parse(raw)
  const addressA = checksumAddress(queryParsed.addressA as Address)
  const addressB = checksumAddress(queryParsed.addressB as Address)
  const protocols = ((queryParsed.protocol as string) || '').split(',') as Protocol[]
  const chainId = Number.parseInt(queryParsed.chainId as string)
  if (!INFINITY_SUPPORTED_CHAINS.includes(chainId) && protocols.includes('infinity')) {
    throw new Error('Invalid chainId')
  }
  for (const protocol of protocols) {
    if (ALLOWED_PROTOCOLS.indexOf(protocol) === -1) {
      throw new Error('Invalid protocol')
    }
  }
  return {
    addressA,
    addressB,
    protocols,
    chainId,
  }
}
