import { Protocol } from '@pancakeswap/farms'
import { InfinityRouter, SmartRouter, V3Pool } from '@pancakeswap/smart-router'
import { Tick } from '@pancakeswap/v3-sdk'
import { getPoolTicks } from 'hooks/useAllTicksQuery'
import { v2Clients, v3Clients } from 'utils/graphql'
import { createViemPublicClientGetter, getViemClients } from 'utils/viem'
import { PoolQuery } from './PoolHashHelper'

export const getV2CandidatePools = async (query: PoolQuery) => {
  const { currencyA, currencyB } = query
  const pools = await SmartRouter.getV2CandidatePools({
    currencyA,
    currencyB,
    v2SubgraphProvider: ({ chainId }) => (chainId ? v2Clients[chainId] : undefined),
    v3SubgraphProvider: ({ chainId }) => (chainId ? v3Clients[chainId] : undefined),
    onChainProvider: getViemClients,
  })
  return pools
}

export const getV3CandidatePools = async (options: PoolQuery) => {
  const pools = await getV3CandidatePoolsWithoutTicks(options)
  return fillV3Ticks(pools)
}

export const getV3CandidatePoolsWithoutTicks = (options: PoolQuery) => {
  const { currencyA, currencyB } = options
  return SmartRouter.getV3CandidatePools({
    currencyA,
    currencyB,
    subgraphProvider: ({ chainId }) => (chainId ? v3Clients[chainId] : undefined),
    onChainProvider: getViemClients,
    blockNumber: options?.options?.blockNumber,
  })
}

export const getV3PoolsWithTicksOnChain = async (query: PoolQuery) => {
  const clientProvider = createViemPublicClientGetter()
  const res = await InfinityRouter.getV3CandidatePools({
    currencyA: query.currencyA,
    currencyB: query.currencyB,
    clientProvider,
    gasLimit: query.options?.gasLimit,
  })
  return res
}

const fillV3Ticks = async (pools: V3Pool[]) => {
  const poolTicks = await Promise.all(
    pools.map(async (pool) => {
      const data = await getPoolTicks({
        chainId: pool.token0.chainId,
        poolAddress: SmartRouter.getPoolAddress(pool),
        protocol: Protocol.V3,
      })
      return data.map(
        ({ tick, liquidityNet, liquidityGross }) => new Tick({ index: Number(tick), liquidityNet, liquidityGross }),
      )
    }),
  )
  return pools?.map((pool, i) => ({
    ...pool,
    ticks: poolTicks[i],
  }))
}

export const getInfinityBinCandidatePools = async (query: PoolQuery) => {
  const pools = await InfinityRouter.getInfinityBinCandidatePools({
    currencyA: query.currencyA,
    currencyB: query.currencyB,
    clientProvider: getViemClients,
  })
  return pools
}

export const getInfinityBinCandidatePoolsWithoutBins = async (query: PoolQuery) => {
  const pools = await InfinityRouter.getInfinityBinCandidatePoolsWithoutBins({
    currencyA: query.currencyA,
    currencyB: query.currencyB,
    clientProvider: getViemClients,
  })
  return pools
}

export const getInfinityClCandidatePools = async (query: PoolQuery) => {
  const { currencyA, currencyB } = query
  const pools = await InfinityRouter.getInfinityClCandidatePools({
    currencyA,
    currencyB,
    clientProvider: getViemClients,
  })
  return pools
}

export const getInfinityClCandidatePoolsWithoutTicks = async (query: PoolQuery) => {
  const { currencyA, currencyB } = query
  const pools = await InfinityRouter.getInfinityClCandidatePoolsWithoutTicks({
    currencyA,
    currencyB,
    clientProvider: getViemClients,
  })
  return pools
}
