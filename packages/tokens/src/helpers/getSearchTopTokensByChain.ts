import { ChainId, UnifiedToken } from '@pancakeswap/sdk'
import { searchTopTokens } from '../searchTopTokens'

export function getSearchTopTokensByChain(chainId?: ChainId): UnifiedToken[] {
  if (!chainId) {
    return []
  }

  const tokens = searchTopTokens[chainId]
  return tokens ?? []
}
