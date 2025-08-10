import { isChainSupported, ChainId, getChainIdByChainName } from '@pancakeswap/chains'
import safeGetWindow from '@pancakeswap/utils/safeGetWindow'

export function getQueryChainId() {
  const window = safeGetWindow()
  if (!window) {
    return ChainId.BSC
  }
  const params = new URL(window.location.href).searchParams
  let chainId: number
  const c = params.get('chain')
  if (!c) {
    chainId = Number(params.get('chainId'))
  } else {
    chainId = getChainIdByChainName(c) || ChainId.BSC
  }
  if (!isChainSupported(chainId)) {
    return ChainId.BSC
  }
  return chainId
}
