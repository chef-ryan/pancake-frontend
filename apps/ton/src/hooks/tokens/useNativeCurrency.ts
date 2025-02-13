import { Native, TonNetworks } from '@pancakeswap/ton-v2-sdk'
import { useAtomValue } from 'jotai'
import { networkAtom } from 'ton/atom/networkAtom'

export const useNativeCurrency = () => {
  const network = useAtomValue(networkAtom)
  return Native.onNetwork(TonNetworks[network])
}
