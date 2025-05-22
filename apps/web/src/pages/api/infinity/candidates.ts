import { INFINITY_SUPPORTED_CHAINS } from '@pancakeswap/infinity-sdk'
import { POOLS_FAST_REVALIDATE } from 'config/pools'
import { NextRequest, NextResponse } from 'next/server'
import qs from 'qs'
import { checksumAddress } from 'utils/checksumAddress'
import { Address } from 'viem/accounts'
import { ALLOWED_PROTOCOLS, poolQueriesFactory, poolQueryPersistURL, Protocol } from './edgePoolQueries'
import { responseJson } from './util'

export const config = {
  runtime: 'edge',
}

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
    const poolQueries = poolQueriesFactory(chainId)
    const epoch = Math.floor(Date.now() / POOLS_FAST_REVALIDATE[chainId])
    const { key, cacheKey } = poolQueryPersistURL(addressA, addressB, chainId, protocols as Protocol[], epoch)
    const pools = await poolQueries.fetchAllPools(addressA, addressB, chainId, protocols as Protocol[])
    return responseJson(pools, {
      epoch: Math.floor(Date.now() / POOLS_FAST_REVALIDATE[chainId]),
      url: `${process.env.NEXT_PUBLIC_PROOF_API}/cache/${key}`,
      cacheKey,
    })
  } catch (ex) {
    console.error('fetch candidates error', ex)
    return NextResponse.json({ error: `fetch candidates error: ${ex}` }, { status: 400 })
  }
}
