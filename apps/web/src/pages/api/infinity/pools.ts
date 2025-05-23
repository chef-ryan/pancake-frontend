import BN from 'bignumber.js'
import { NextRequest, NextResponse } from 'next/server'
import qs from 'qs'
import { edgeQueries } from 'quoter/utils/edgePoolQueries'

export const config = {
  runtime: 'edge',
}

const MAX_CACHE_SECONDS = 60 * 60
const BASE_URL = 'https://explorer.pancakeswap.com/api/cached/pools/list'

export default async function handler(req: NextRequest) {
  const raw = new URL(req.url).search.slice(1)
  if (!raw) {
    return NextResponse.json({ error: 'Invalid query' }, { status: 400 })
  }
  const queryParsed = qs.parse(raw)
  const _protocol = queryParsed.protocol
  const protocols =
    typeof _protocol === 'string' ? [_protocol] : Array.isArray(_protocol) ? (_protocol as string[]) : undefined
  const chain = queryParsed.chain
  const supported = ['infinityCl', 'infinityBin']
  const valid = protocols && protocols.every((p) => supported.includes(p))
  if (!valid) {
    return NextResponse.json({ error: 'Invalid protocol or chain' }, { status: 400 })
  }

  try {
    // eslint-disable-next-line no-await-in-loop
    const pools = await edgeQueries.fetchAllPools({
      baseUrl: BASE_URL,
      protocols: protocols as ('infinityBin' | 'infinityCl')[],
      chains: [chain as any],
    })

    const result = pools.map((p) => ({
      id: p.id,
      tvlUSD: new BN(p.tvlUSD).decimalPlaces(0, BN.ROUND_CEIL).toString(),
    }))

    return NextResponse.json(
      {
        data: result,
        lastUpdated: Number(Date.now()),
      },
      {
        status: 200,
        headers: {
          'Cache-Control': `max-age=${MAX_CACHE_SECONDS}, s-maxage=${MAX_CACHE_SECONDS}`,
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (err) {
    return NextResponse.json({ error: `${err}` }, { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
