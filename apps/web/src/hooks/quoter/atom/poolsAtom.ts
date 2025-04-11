import { Pool } from '@pancakeswap/smart-router'

import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { isEqualPoolQuery, PoolQuery } from './PoolHashHelper'
import {
  getInfinityBinCandidatePools,
  getInfinityBinCandidatePoolsWithoutBins,
  getInfinityClCandidatePools,
  getInfinityClCandidatePoolsWithoutTicks,
  getV2CandidatePools,
  getV3CandidatePools,
  getV3CandidatePoolsWithoutTicks,
  getV3PoolsWithTicksOnChain,
} from './poolQueries'

export const commonPoolsOnChainAtom = atomFamily((query: PoolQuery) => {
  return atom(async () => {
    const poolsArray = await Promise.all([
      getV2CandidatePools(query),
      getV3PoolsWithTicksOnChain(query),
      getInfinityClCandidatePools(query),
      getInfinityBinCandidatePools(query),
    ])
    return poolsArray.flat() as Pool[]
  })
}, isEqualPoolQuery)

export const commonPoolsAtom = atomFamily((query: PoolQuery) => {
  return atom(async () => {
    const poolsArray = await Promise.all([
      getV2CandidatePools(query),
      getV3CandidatePools(query),
      getInfinityClCandidatePools(query),
      getInfinityBinCandidatePools(query),
    ])

    return poolsArray.flat() as Pool[]
  })
}, isEqualPoolQuery)

export const commonPoolsLiteAtom = atomFamily((query: PoolQuery) => {
  return atom(async () => {
    const poolsArray = await Promise.all([
      getV2CandidatePools(query),
      getV3CandidatePoolsWithoutTicks(query),
      getInfinityClCandidatePoolsWithoutTicks(query),
      getInfinityBinCandidatePoolsWithoutBins(query),
    ])
    return poolsArray.flat() as Pool[]
  })
}, isEqualPoolQuery)
