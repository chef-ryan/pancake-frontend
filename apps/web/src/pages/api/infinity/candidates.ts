import { ChainId } from '@pancakeswap/chains'
import { INFINITY_SUPPORTED_CHAINS } from '@pancakeswap/infinity-sdk'
import { NextRequest, NextResponse } from 'next/server'
import qs from 'qs'
import { checksumAddress } from 'utils/checksumAddress'
import { Address } from 'viem/accounts'
import { poolQueriesFactory } from './edgePoolQueries'
import { responseJson } from './util'

export const config = {
  runtime: 'edge',
}

type Protocol = 'v2' | 'ss' | 'v3' | 'infinity'

const ALLOWED_PROTOCOLS = ['v2', 'ss', 'v3', 'infinity']

export default async function handler(req: NextRequest) {
  const raw = new URL(req.url).search.slice(1)
  if (!raw) {
    return NextResponse.json({ error: 'Invalid query' }, { status: 400 })
  }
  const queryParsed = qs.parse(raw)
  const addressA = checksumAddress(queryParsed.addressA as Address)
  const addressB = checksumAddress(queryParsed.addressB as Address)
  const protocols = ((queryParsed.protocol as string) || '').split(',')
  const chainId = Number.parseInt(queryParsed.chainId as string)
  if (!INFINITY_SUPPORTED_CHAINS.includes(chainId)) {
    return NextResponse.json({ error: 'Invalid chainId' }, { status: 400 })
  }
  for (const protocol of protocols) {
    if (ALLOWED_PROTOCOLS.indexOf(protocol) === -1) {
      return NextResponse.json({ error: 'Invalid protocol' }, { status: 400 })
    }
  }

  try {
    const queries = await Promise.all(
      protocols.map((protocol) => query(chainId, protocol as Protocol, addressA, addressB)),
    )
    const pools = queries.flat()
    return responseJson(pools)
  } catch (ex) {
    console.error('fetch candidates error', ex)
    return NextResponse.json({ error: `fetch candidates error: ${ex}` }, { status: 400 })
  }
}

const query = async (chainId: ChainId, protocol: Protocol, addressA: Address, addressB: Address) => {
  const poolQueries = poolQueriesFactory(chainId)
  switch (protocol) {
    case 'v2': {
      return poolQueries.fetchV2Pools(addressA, addressB, chainId)
    }
    case 'ss': {
      return poolQueries.fetchSSPool(addressA, addressB, chainId)
    }
    case 'v3': {
      return poolQueries.fetchV3Pools(addressA, addressB, chainId)
    }
    case 'infinity': {
      return poolQueries.fetchInfinityPools(addressA, addressB, chainId)
    }
    default:
      throw new Error('invalid pool')
  }
}
