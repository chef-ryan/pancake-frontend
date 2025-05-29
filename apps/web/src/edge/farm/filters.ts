import { ChainId } from '@pancakeswap/chains'
import { Protocol } from '@pancakeswap/farms'
import { InfinityRouter } from '@pancakeswap/smart-router'

const chainFilter = (chains: ChainId[]) => {
  return (pool: InfinityRouter.RemotePoolBase): boolean => {
    if (!chains || chains.length === 0) return true
    const chainId = pool.chainId
    if (chains.indexOf(chainId) === -1) {
      return false
    }
    return true
  }
}

const protocolFilter = (protocols: Protocol[]) => {
  return (pool: InfinityRouter.RemotePoolBase): boolean => {
    if (!protocols || protocols.length === 0) return true
    if (protocols.indexOf(pool.protocol as Protocol) === -1) {
      return false
    }
    return true
  }
}

export const farmFilters = {
  chainFilter,
  protocolFilter,
}
