import { ChainId } from '@pancakeswap/chains'
import { hooksList, INFINITY_SUPPORTED_CHAINS } from '@pancakeswap/infinity-sdk'
import {
  InfinityBinPool,
  InfinityClPool,
  InfinityRouter,
  OnChainProvider,
  PoolType,
  WithTvl,
} from '@pancakeswap/smart-router'
import { cacheByLRU } from '@pancakeswap/utils/cacheByLRU'
import { NextRequest, NextResponse } from 'next/server'
import qs from 'qs'
import { checksumAddress } from 'utils/checksumAddress'
import { getViemClients } from 'utils/viem.server'
import { Address } from 'viem/accounts'

export const config = {
  runtime: 'edge',
}

const MAX_CACHE_SECONDS = 20

const query = cacheByLRU(
  async (addressA: Address, addressB: Address, chainId: ChainId) => {
    const pools = await InfinityRouter.fetchInfinityPoolsFromApi(addressA, addressB, chainId)
    const localPools = pools
      .map((pool) => {
        return InfinityRouter.toLocalInfinityPool(pool, chainId as keyof typeof hooksList)
      })
      .filter((x) => x) as (InfinityClPool | InfinityBinPool)[]
    const localClPools = localPools.filter((pool) => pool.type === PoolType.InfinityCL)
    const localBinPools = localPools.filter((pool) => pool.type === PoolType.InfinityBIN)
    const [poolWithTicks, poolWithBins] = await Promise.all([
      InfinityRouter.fillClPoolsWithTicks({
        pools: localClPools,
        clientProvider: getViemClients as OnChainProvider,
      }),
      InfinityRouter.fillPoolsWithBins({
        pools: localBinPools,
        clientProvider: getViemClients as OnChainProvider,
      }),
    ])

    const result = [...poolWithTicks, ...poolWithBins].map((p) => {
      return InfinityRouter.toRemoteInfinityPool(p as (InfinityClPool & WithTvl) | (InfinityBinPool & WithTvl))
    })
    return result
  },
  {
    ttl: 10_000,
  },
)

export default async function handler(req: NextRequest) {
  const raw = new URL(req.url).search.slice(1)
  if (!raw) {
    return NextResponse.json({ error: 'Invalid query' }, { status: 400 })
  }
  const queryParsed = qs.parse(raw)
  const addressA = checksumAddress(queryParsed.addressA as Address)
  const addressB = checksumAddress(queryParsed.addressB as Address)
  const chainId = Number.parseInt(queryParsed.chainId as string)
  if (!INFINITY_SUPPORTED_CHAINS.includes(chainId)) {
    return NextResponse.json({ error: 'Invalid chainId' }, { status: 400 })
  }
  const pools = await query(addressA, addressB, chainId)

  try {
    return NextResponse.json(
      {
        data: pools,
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
