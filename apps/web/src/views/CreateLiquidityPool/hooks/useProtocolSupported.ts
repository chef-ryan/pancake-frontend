import { isEvm } from '@pancakeswap/chains'
import { INFINITY_SUPPORTED_CHAINS } from '@pancakeswap/infinity-sdk'
import { useMemo } from 'react'

export const useProtocolSupported = (chainId: number) => {
  const isInfinitySupported = useMemo(() => INFINITY_SUPPORTED_CHAINS.includes(chainId), [chainId])
  const isV2Supported = useMemo(() => isEvm(chainId), [chainId])
  return {
    isInfinitySupported,
    isV2Supported,
  }
}
