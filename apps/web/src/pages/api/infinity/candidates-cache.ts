import { ChainId } from '@pancakeswap/chains'
import { cacheByLRU } from '@pancakeswap/utils/cacheByLRU'
import { takeFirstFulfilled } from '@pancakeswap/utils/promise'
import { POOLS_FAST_REVALIDATE } from 'config/pools'
import { NextRequest, NextResponse } from 'next/server'
import { Address } from 'viem/accounts'
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

    const { pools, cacheKey, key, index } = await query(addressA, addressB, chainId, protocols)

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

const query = cacheByLRU(
  async (addressA: Address, addressB: Address, chainId: ChainId, protocols: Protocol[]) => {
    const poolQueries = poolQueriesFactory(chainId)
    const query = async () => {
      const pools = await poolQueries.fetchAllPools(addressA, addressB, chainId, protocols as Protocol[])
      return pools
    }
    const epoch = Math.floor(Date.now() / POOLS_FAST_REVALIDATE[chainId])
    const { key, cacheKey } = poolQueryPersistURL(addressA, addressB, chainId, protocols as Protocol[], epoch)
    const { url: prev } = poolQueryPersistURL(addressA, addressB, chainId, protocols as Protocol[], epoch - 1)
    const { url: prev1 } = poolQueryPersistURL(addressA, addressB, chainId, protocols as Protocol[], epoch - 2)
    const { result: pools, index } = await takeFirstFulfilled([query(), fetchCDN(prev), fetchCDN(prev1)])
    return { pools, index, key, cacheKey }
  },
  {
    ttl: 5_000,
    parallelism: 3,
  },
)
