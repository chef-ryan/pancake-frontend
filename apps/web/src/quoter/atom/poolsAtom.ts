import { Pool } from '@pancakeswap/smart-router'

import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { PoolQuery } from 'quoter/quoter.types'
import { isEqualPoolQuery } from 'quoter/utils/PoolHashHelper'
import {
  getInfinityCandidatePools,
  getInfinityCandidatePoolsLight,
  getStableSwapPools,
  getV2CandidatePools,
  getV3CandidatePools,
  getV3CandidatePoolsWithoutTicks,
  getV3PoolsWithTicksOnChain,
} from '../utils/poolQueries'

export const commonPoolsOnChainAtom = atomFamily((query: PoolQuery) => {
  return atom(async () => {
    try {
      const poolsArray = await Promise.all([
        getStableSwapPools(query),
        getV2CandidatePools(query),
        getV3PoolsWithTicksOnChain(query),
        getInfinityCandidatePools(query),
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
      const poolsArray = await Promise.all([
        getStableSwapPools(query),
        getV2CandidatePools(query),
        getV3CandidatePools(query),
        getInfinityCandidatePools(query),
      ])

      return poolsArray.flat() as Pool[]
    } catch (ex) {
      console.warn(ex)
      return []
    }
  })
}, isEqualPoolQuery)

export const commonPoolsLiteAtom = atomFamily((query: PoolQuery) => {
  return atom(async () => {
    try {
      const poolsArray = await Promise.all([
        getStableSwapPools(query),
        getV2CandidatePools(query),
        getV3CandidatePoolsWithoutTicks(query),
        getInfinityCandidatePoolsLight(query),
      ])
      return poolsArray.flat() as Pool[]
    } catch (ex) {
      console.warn(ex)
      return []
    }
  })
}, isEqualPoolQuery)
