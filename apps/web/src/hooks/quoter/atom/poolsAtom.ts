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
import { poolVersionAtom } from './revalidateAtom'

export const commonPoolsOnChainAtom = atomFamily((query: PoolQuery) => {
  return atom(async (get) => {
    get(poolVersionAtom(query))
    const { infinity } = query
    try {
      const poolsArray = await Promise.all([
        getV2CandidatePools(query),
        getV3PoolsWithTicksOnChain(query),
        infinity ? getInfinityClCandidatePools(query) : [],
        infinity ? getInfinityBinCandidatePools(query) : [],
      ])
      return poolsArray.flat() as Pool[]
    } catch (ex) {
      console.warn(ex)
      return []
    }
  })
}, isEqualPoolQuery)

export const commonPoolsAtom = atomFamily((query: PoolQuery) => {
  return atom(async (get) => {
    try {
      get(poolVersionAtom(query))
      const { infinity } = query
      const poolsArray = await Promise.all([
        getV2CandidatePools(query),
        getV3CandidatePools(query),
        infinity ? getInfinityClCandidatePools(query) : [],
        infinity ? getInfinityBinCandidatePools(query) : [],
      ])

      return poolsArray.flat() as Pool[]
    } catch (ex) {
      console.warn(ex)
      return []
    }
  })
}, isEqualPoolQuery)

export const commonPoolsLiteAtom = atomFamily((query: PoolQuery) => {
  return atom(async (get) => {
    const { infinity } = query
    try {
      get(poolVersionAtom(query))
      const poolsArray = await Promise.all([
        getV2CandidatePools(query),
        getV3CandidatePoolsWithoutTicks(query),
        infinity ? getInfinityClCandidatePoolsWithoutTicks(query) : [],
        infinity ? getInfinityBinCandidatePoolsWithoutBins(query) : [],
      ])
      return poolsArray.flat() as Pool[]
    } catch (ex) {
      console.warn(ex)
      return []
    }
  })
}, isEqualPoolQuery)
