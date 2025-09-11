import { getCurrencyAddress } from '@pancakeswap/sdk'
import { SmartRouter } from '@pancakeswap/smart-router'
import { TokenInfo } from '@pancakeswap/token-lists'

import { FarmInfo } from 'state/farmsV4/search/farm.util'

export const filterTokens = (tokensMap: Record<string, TokenInfo>) => {
  return (farm: FarmInfo) => {
    const [token0, token1] = SmartRouter.getCurrenciesOfPool(farm.pool)
    if (!token0 || !token1) return false
    const key0 = `${token0.chainId}:${getCurrencyAddress(token0)}`.toLowerCase()
    const key1 = `${token0.chainId}:${getCurrencyAddress(token1)}`.toLowerCase()
    if (token0.isNative) {
      const keyWrapped = `${token0.chainId}:${token0.wrapped.address}`.toLowerCase()
      if (tokensMap[keyWrapped]) {
        return true
      }
    }
    if (token1.isNative) {
      const keyWrapped = `${token1.chainId}:${token1.wrapped.address}`.toLowerCase()
      if (tokensMap[keyWrapped]) {
        return true
      }
    }

    if (!tokensMap[key0] || !tokensMap[key1]) {
      return false
    }
    return true
  }
}

export const isInWhitelist = (tokensMap: Record<string, TokenInfo>) => {
  return (farm: FarmInfo) => {
    const [token0, token1] = SmartRouter.getCurrenciesOfPool(farm.pool)
    if (!token0 || !token1) return false
    const key0 = `${token0.chainId}:${getCurrencyAddress(token0)}`.toLowerCase()
    const key1 = `${token0.chainId}:${getCurrencyAddress(token1)}`.toLowerCase()

    if (!tokensMap[key0] || !tokensMap[key1]) {
      return false
    }
    return true
  }
}
