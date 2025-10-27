import { SunsetChainId } from '@pancakeswap/chains'

const SUNSET_LEGACY_LINKS: Record<SunsetChainId, string> = {
  [SunsetChainId.POLYGON_ZKEVM]: 'https://legacy-zkevm.pancakeswap.finance/',
  [SunsetChainId.POLYGON_ZKEVM_TESTNET]: 'https://legacy-zkevm.pancakeswap.finance/',
}

export function getSunsetLegacyLink(chainId?: number): string | undefined {
  if (!chainId) return undefined
  return SUNSET_LEGACY_LINKS[chainId as SunsetChainId]
}
