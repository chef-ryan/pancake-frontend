import { ChainId, getChainName } from '@pancakeswap/chains'
import { hooksList } from '@pancakeswap/infinity-sdk'
import { getCurrencyAddress } from '@pancakeswap/swap-sdk-core'
import { cacheByLRU } from '@pancakeswap/utils/cacheByLRU'
import { Address } from 'viem'
import { infinityPoolTvlSelector } from '../../v3-router/providers'
import { InfinityBinPool, InfinityClPool, InfinityPoolWithTvl, PoolType } from '../../v3-router/types'
import { GetInfinityCandidatePoolsParams } from '../types'
import { fillPoolsWithBins, getInfinityBinCandidatePoolsWithoutBins } from './getInfinityBinPools'
import { fillClPoolsWithTicks, getInfinityClCandidatePoolsWithoutTicks } from './getInfinityClPools'
import { getInfinityPoolTvl, getInfinityTvlReference } from './getPoolTvl'
import { RemotePoolBIN, RemotePoolCL } from './remotePool.type'
import { toLocalInfinityPool } from './remotePoolTransform'

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

export const fetchInfinityPoolsApi = cacheByLRU(
  async (params: GetInfinityCandidatePoolsParams) => {
    const { currencyA, currencyB } = params
    const chainId = currencyA?.chainId
    const pools = await fetchParsedInfinityPoolsFromApi(
      getCurrencyAddress(currencyA!),
      getCurrencyAddress(currencyB!),
      chainId!,
    )

    return pools as InfinityPoolWithTvl[]
  },
  {
    ttl: 5_000,
    key: (args) => {
      const params = args[0]
      const chainId = params.currencyA?.chainId
      return [
        chainId,
        getCurrencyAddress(params.currencyA!),
        getCurrencyAddress(params.currencyB!),
        params.currencyA?.chainId,
        params.currencyB?.chainId,
      ]
    },
  },
)

async function fetchPools(params: GetInfinityCandidatePoolsParams) {
  try {
    const result = await fetchInfinityPoolsApi(params)
    return result
  } catch (ex) {
    console.warn(ex)
    return fetchPoolsOnChain(params)
  }
}

export const getInfinityCandidatePoolsLite = async (
  params: GetInfinityCandidatePoolsParams,
): Promise<(InfinityClPool | InfinityBinPool)[]> => {
  const pools = await fetchPools(params)
  const filtered = infinityPoolTvlSelector(params.currencyA, params.currencyB, pools)
  return filtered as (InfinityClPool | InfinityBinPool)[]
}

export async function fetchParsedInfinityPoolsFromApi(addressA: Address, addressB: Address, chainId: ChainId) {
  const data = await fetchInfinityPoolsFromApi(addressA, addressB, chainId)
  const filtered = data.map((pool) => toLocalInfinityPool(pool, chainId as keyof typeof hooksList)).filter((x) => x)
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
