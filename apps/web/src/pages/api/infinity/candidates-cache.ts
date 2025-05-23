import { ChainId } from '@pancakeswap/chains'
import { POOLS_SLOW_REVALIDATE } from 'config/pools'
import { NextRequest, NextResponse } from 'next/server'
import { Address } from 'viem/accounts'
import { fetchAllPools } from './edgePoolQueries'
import { parseCandidatesQuery, Protocol } from './util'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: NextRequest) {
  const raw = new URL(req.url).search.slice(1)
  try {
    const { chainId, addressA, addressB, protocols } = parseCandidatesQuery(raw)
    const pools = await query(addressA, addressB, chainId, protocols)
    const age = POOLS_SLOW_REVALIDATE[chainId] as number
    const staleAge = age * 6
    return NextResponse.json(
      {
        data: pools,
        lastUpdated: Number(Date.now()),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': `public, s-maxage=${age}, stale-while-revalidate=${staleAge}`,
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (ex) {
    console.error(ex)
    return NextResponse.json({ error: `fetch candidates error ` }, { status: 400 })
  }
}

const query = async (addressA: Address, addressB: Address, chainId: ChainId, protocols: Protocol[]) => {
  const query = async () => {
    const pools = await fetchAllPools(addressA, addressB, chainId, protocols as Protocol[])
    return pools
  }
  const pools = query()
  return pools
}
