import { infinityPoolTvlSelector } from '../../v3-router/providers'
import { InfinityBinPool, InfinityClPool, InfinityPoolWithTvl, PoolType } from '../../v3-router/types'
import { GetInfinityCandidatePoolsParams } from '../types'
import { fillPoolsWithBins, getInfinityBinCandidatePoolsWithoutBins } from './getInfinityBinPools'
import { fillClPoolsWithTicks, getInfinityClCandidatePoolsWithoutTicks } from './getInfinityClPools'
import { getInfinityPoolTvl, getInfinityTvlReference } from './getPoolTvl'

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

export const getInfinityCandidatePoolsLite = async (
  params: GetInfinityCandidatePoolsParams,
): Promise<(InfinityClPool | InfinityBinPool)[]> => {
  const [clPools, binPools, tvlMap] = await Promise.all([
    getInfinityClCandidatePoolsWithoutTicks(params),
    getInfinityBinCandidatePoolsWithoutBins(params),
    getInfinityTvlReference(params),
  ])
  const pools = [...clPools, ...binPools].filter((p) => {
    return [
      '0x47516855520496B84A169F7BB92ACE7FFB6E8C535BCCB52A308CCFF113AECCFB',
      '0x3C2C41B2711BF990822E25135EAB4EFFE9BD33C8D016FD19DC131D7C9E2A432D',
      '0xEE2B3272CEBB007EDE79E851A7DE89B07551E20F676F6283C34EB2ECAECD629E',
      '0xfe667c7c01a2db5d30fe3c6411feaaadd05c10768319d112a84f20c1d207a6ae',
      '0x0F7DDAD79DF9A2718B5F7BC17EBC98CC755C0F676983CA8A6A7D2DAD40717C79',
      '0x54C27041DFA246727D9351613EB35DA028DDF377225D8DB9E68CA3B569B5BA24',
    ]
      .map((x) => x.toLowerCase())
      .includes(p.id.toLowerCase())
  })
  const poolsWithTvl: InfinityPoolWithTvl[] = pools.map((pool) => {
    return {
      ...pool,
      tvlUSD: getInfinityPoolTvl(tvlMap, pool.id),
    } as InfinityPoolWithTvl
  })
  const filtered = infinityPoolTvlSelector(params.currencyA, params.currencyB, poolsWithTvl)
  return filtered as (InfinityClPool | InfinityBinPool)[]
}
