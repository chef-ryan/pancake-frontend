import { ChainId } from '@pancakeswap/chains'
import { OnChainProvider, SmartRouter } from '@pancakeswap/smart-router'
import { NextResponse } from 'next/server'
import { getViemClients } from 'utils/viem.server'
import { Address } from 'viem/accounts'

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
