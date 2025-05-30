import { ChainId } from '@pancakeswap/chains'
import { Protocol } from '@pancakeswap/farms'
import { FarmInfo, FarmProps } from './farm.util'

const chainFilter = (chains: ChainId[]) => {
  return (farm: FarmInfo): boolean => {
    if (!chains || chains.length === 0) return true
    const chainId = farm.chainId
    if (chains.indexOf(chainId) === -1) {
      return false
    }
    return true
  }
}

const protocolFilter = (protocols: Protocol[]) => {
  return (farm: FarmInfo): boolean => {
    if (!protocols || protocols.length === 0) return true
    if (protocols.indexOf(farm.protocol as Protocol) !== -1) {
      return true
    }
    return false
  }
}

const sortWithPid = (a: FarmProps, b: FarmProps) => {
  if (a.pid && !b.pid) {
    return -1
  }
  if (!a.pid && b.pid) {
    return 1
  }
  return 0
}

export const farmFilters = {
  chainFilter,
  protocolFilter,
  sortWithPid,
}
