import { ChainId, getChainName, SunsetChainId } from '@pancakeswap/chains'

const SUNSET_CHAIN_NAME_MAP: Record<SunsetChainId, string> = {
  [SunsetChainId.POLYGON_ZKEVM]: 'polygonZkEVM',
  [SunsetChainId.POLYGON_ZKEVM_TESTNET]: 'polygonZkEVMTestnet',
}

export function getChainDisplayName(chainId: number): string {
  if (chainId === ChainId.BSC) {
    return 'BNB'
  }

  if (chainId in SUNSET_CHAIN_NAME_MAP) {
    return SUNSET_CHAIN_NAME_MAP[chainId as SunsetChainId]
  }

  return getChainName(chainId)
}
