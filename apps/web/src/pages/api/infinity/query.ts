import { getChainName } from '@pancakeswap/chains'
import { ChainId, Native } from '@pancakeswap/sdk'
import {
  BASES_TO_CHECK_TRADES_AGAINST,
  InfinityBinPool,
  InfinityClPool,
  InfinityRouter,
  OnChainProvider,
  SmartRouter,
} from '@pancakeswap/smart-router'
import { Currency, Token } from '@pancakeswap/swap-sdk-core'
import { cacheByLRU } from '@pancakeswap/utils/cacheByLRU'
import memoize from 'lodash/memoize'
import { NextApiHandler } from 'next'
import { CurrencyInfo, PoolQueryRequest } from 'quoter/quoter.types'
import { PoolHashHelper } from 'quoter/utils/PoolHashHelper'
import { v2Clients, v3Clients } from 'utils/graphql'
import { getViemClients } from 'utils/viem.server'
import { fetchAllPoolsTvl } from './pools'

function getCurrency(c: CurrencyInfo, chainId: ChainId) {
  if (c.isNative) {
    return Native.onChain(chainId)
  }
  return new Token(chainId, c.address, c.decimals, c.symbol, c.name)
}

const getBaseSet = memoize((chainId: ChainId) => {
  const baseTokens = BASES_TO_CHECK_TRADES_AGAINST[chainId] ?? []
  if (baseTokens.length === 0) {
    return new Set<`0x${string}`>()
  }
  return new Set<`0x${string}`>(baseTokens.map((t) => t.address))
})

function inBaseSet(c: Currency, chainId: ChainId) {
  const baseSet = getBaseSet(chainId)
  if (c.isNative) {
    return true
  }
  return baseSet.has(c.wrapped.address)
}

const handler: NextApiHandler = async (req, res) => {
  const { currencyA, currencyB, chainId } = req.body as PoolQueryRequest
  if (!currencyA || !currencyB || !chainId) {
    return []
  }

  const c0 = getCurrency(currencyA, chainId)
  const c1 = getCurrency(currencyB, chainId)
  if (!inBaseSet(c0, chainId) || !inBaseSet(c1, chainId)) {
    return []
  }
  const pools = fetchPoolData(c0, c1, chainId)

  return res.status(200).json({
    data: pools,
  })
}

interface InfinityPoolTvlReference extends Pick<InfinityClPool | InfinityBinPool, 'id'> {
  tvlUSD: bigint | string
}

type InfinityPoolTvlReferenceMap = Record<`0x${string}`, InfinityPoolTvlReference>

const _fetchPoolData = async (c0: Currency, c1: Currency, chainId: ChainId) => {
  const resolvedPairs = await SmartRouter.getPairCombinations(c0, c1)

  const provider: OnChainProvider = ({ chainId }) => {
    if (chainId) {
      return getViemClients({ chainId })
    }
    return undefined
  }

  const chain = getChainName(chainId)
  const refs = await fetchAllPoolsTvl(['infinityCl', 'infinityBin'], chain)
  const map: InfinityPoolTvlReferenceMap = {}
  for (const ref of refs) {
    map[ref.id] = ref
  }

  const [ssPools, v2Pools, v3Pools, infinityPools] = await Promise.all([
    SmartRouter.getStablePoolsOnChain(resolvedPairs ?? [], provider),
    SmartRouter.getV2CandidatePools({
      currencyA: c0,
      currencyB: c1,
      v2SubgraphProvider: ({ chainId }) => (chainId ? v2Clients[chainId] : undefined),
      v3SubgraphProvider: ({ chainId }) => (chainId ? v3Clients[chainId] : undefined),
      onChainProvider: provider,
    }),
    SmartRouter.getV3CandidatePools({
      currencyA: c0,
      currencyB: c1,
    }),
    InfinityRouter.getInfinityCandidatePools({
      currencyA: c0,
      currencyB: c1,
      clientProvider: provider,
      tvlRefMap: map,
    }),
  ])

  const pools = [...ssPools, ...v2Pools, ...v3Pools, ...infinityPools].map((x) =>
    SmartRouter.Transformer.serializePool(x),
  )
  return pools
}

const fetchPoolData = cacheByLRU(_fetchPoolData, {
  ttl: 10_000,
  maxCacheSize: 1000,
  key: ([c0, c1, chainId]) => {
    const chash = PoolHashHelper.hashCurrencies(c0, c1)
    const hash = `${chash}-${chainId}`
    return hash
  },
})

export default handler
