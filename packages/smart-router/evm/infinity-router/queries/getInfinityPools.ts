import { ChainId, getChainName } from '@pancakeswap/chains'
import { Address } from 'viem'
import { infinityPoolTvlSelector } from '../../v3-router/providers'
import { InfinityBinPool, InfinityClPool, InfinityPoolWithTvl, PoolType } from '../../v3-router/types'
import { GetInfinityCandidatePoolsParams } from '../types'
import { fillPoolsWithBins, getInfinityBinCandidatePoolsWithoutBins } from './getInfinityBinPools'
import { fillClPoolsWithTicks, getInfinityClCandidatePoolsWithoutTicks } from './getInfinityClPools'
import { getInfinityPoolTvl, getInfinityTvlReference } from './getPoolTvl'
import { RemotePoolBIN, RemotePoolCL } from './remotePool.type'

export const getInfinityCandidatePools = async (params: GetInfinityCandidatePoolsParams) => {
  const pools = await getInfinityCandidatePoolsLite(params)
  const clPools = pools.filter((pool) => pool.type === PoolType.InfinityCL) as InfinityClPool[]
  const binPools = pools.filter((pool) => pool.type === PoolType.InfinityBIN) as InfinityBinPool[]

  const [poolWithTicks, poolWithBins] = await Promise.all([
    fillClPoolsWithTicks({
      pools: clPools,
      clientProvider: params.clientProvider,
      gasLimit: params.gasLimit,
    }),
    fillPoolsWithBins({
      pools: binPools,
      clientProvider: params.clientProvider,
      gasLimit: params.gasLimit,
    }),
  ])
  return [...poolWithTicks, ...poolWithBins]
}

async function fetchPoolsOnChain(params: GetInfinityCandidatePoolsParams) {
  const [clPools, binPools, tvlMap] = await Promise.all([
    getInfinityClCandidatePoolsWithoutTicks(params),
    getInfinityBinCandidatePoolsWithoutBins(params),
    getInfinityTvlReference(params),
  ])
  const pools = [...clPools, ...binPools]
  const poolsWithTvl: InfinityPoolWithTvl[] = pools.map((pool) => {
    return {
      ...pool,
      tvlUSD: getInfinityPoolTvl(tvlMap, pool.id),
    } as InfinityPoolWithTvl
  })
  return poolsWithTvl
}

async function fetchPools(params: GetInfinityCandidatePoolsParams) {
  return fetchPoolsOnChain(params)
}

export const getInfinityCandidatePoolsLite = async (
  params: GetInfinityCandidatePoolsParams,
): Promise<(InfinityClPool | InfinityBinPool)[]> => {
  const pools = await fetchPools(params)
  const filtered = infinityPoolTvlSelector(params.currencyA, params.currencyB, pools)
  return filtered as (InfinityClPool | InfinityBinPool)[]
}

export async function fetchInfinityPoolsFromApi(addressA: Address, addressB: Address, chainId: ChainId) {
  const chain = getChainName(chainId)
  const url = `${process.env.NEXT_PUBLIC_EXPLORE_API_ENDPOINT}/cached/pools/candidates/infinity/${chain}/${addressA}/${addressB}`
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Error fetching infinity pools: ${response.statusText}`)
  }
  const data = (await response.json()) as (RemotePoolCL | RemotePoolBIN)[]
  return data
}
