import { PoolType } from '@pancakeswap/smart-router'
import { QuoteOption } from '../quoter.types'

export function getAllowedPoolTypes(options: QuoteOption) {
  const { infinitySwap, v2Swap, v3Swap, stableSwap } = options
  const types: PoolType[] = []
  if (infinitySwap) {
    types.push(PoolType.InfinityBIN)
    types.push(PoolType.InfinityCL)
  }
  if (v2Swap) {
    types.push(PoolType.V2)
  }
  if (v3Swap) {
    types.push(PoolType.V3)
  }
  if (stableSwap) {
    types.push(PoolType.STABLE)
  }
  return types
}

export function getAllowedPoolTypesX(options: QuoteOption) {
  const { v2Swap, v3Swap, stableSwap } = options
  const types: PoolType[] = []

  if (v2Swap) {
    types.push(PoolType.V2)
  }
  if (v3Swap) {
    types.push(PoolType.V3)
  }
  if (stableSwap) {
    types.push(PoolType.STABLE)
  }
  return types
}
