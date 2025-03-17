import { Native } from '@pancakeswap/ton-v2-sdk'
import { useAtomValue } from 'jotai'
import { chainIdAtom } from 'ton/atom/chainIdAtom'

export const useNativeCurrency = () => {
  const chainId = useAtomValue(chainIdAtom)
  return Native.onChain(chainId)
}
