import { Native } from '@pancakeswap/routing-sdk-addon-ton'
import { useAtomValue } from 'jotai'
import { networkAtom } from 'ton/atom/networkAtom'
import { TonNetworks } from 'ton/ton.enums'

export const useNativeCurrency = (): any => {
  const network = useAtomValue(networkAtom)
  return Native.onNetwork(TonNetworks[network])
}
