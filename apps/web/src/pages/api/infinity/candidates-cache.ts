import { takeFirstFulfilled } from '@pancakeswap/utils/promise'
import { POOLS_FAST_REVALIDATE } from 'config/pools'
import { NextRequest, NextResponse } from 'next/server'
import { poolQueriesFactory, poolQueryPersistURL } from './edgePoolQueries'
import { parseCandidatesQuery, Protocol, responseJson } from './util'

export const config = {
  runtime: 'edge',
}

async function fetchCDN(url: string) {
  const resp = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  if (resp.ok) {
    return resp.json()
  }
  throw new Error(`fetch cdn error: ${resp.status} ${resp.statusText}`)
}

export default async function handler(req: NextRequest) {
  const raw = new URL(req.url).search.slice(1)
  try {
    const { chainId, addressA, addressB, protocols } = parseCandidatesQuery(raw)

    const poolQueries = poolQueriesFactory(chainId)
    const query = async () => {
      const pools = await poolQueries.fetchAllPools(addressA, addressB, chainId, protocols as Protocol[])
      return pools
    }

    const epoch = Math.floor(Date.now() / POOLS_FAST_REVALIDATE[chainId])
    const { key, cacheKey } = poolQueryPersistURL(addressA, addressB, chainId, protocols as Protocol[], epoch)
    const { url: prev } = poolQueryPersistURL(addressA, addressB, chainId, protocols as Protocol[], epoch - 1)
    const { result: pools, index } = await takeFirstFulfilled([query(), fetchCDN(prev)])

    return responseJson(pools, {
      epoch: Math.floor(Date.now() / POOLS_FAST_REVALIDATE[chainId]),
      url: `${process.env.NEXT_PUBLIC_PROOF_API}/cache/${key}`,
      cacheKey,
      route: index === 0 ? 'api' : 'cdn',
    })
  } catch (ex) {
    console.error(ex)
    return NextResponse.json({ error: `fetch candidates error ` }, { status: 400 })
  }
}
