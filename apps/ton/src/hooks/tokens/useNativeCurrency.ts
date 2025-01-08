import { useAtomValue } from 'jotai'
import { networkAtom } from 'ton/atom/networkAtom'
import { TonNetworks } from 'ton/ton.enums'

export const useNativeCurrency = (): any => {
  const network = useAtomValue(networkAtom)
  // TODO: Replace it
  return {
    isNative: true,
    isToken: false,
    symbol: 'TON',
    name: 'TON',
    decimals: 9,
    chainId: network === TonNetworks.Mainnet ? -239 : -3, // TODO: Replace chainId itself later on, create separate an agnostic swap-sdk-core
    logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ton/info/logo.png',
    equals: () => false,
    sortsBefore: () => false,
    address: '',
    wrapped: null,
    serialize: null,
  }
}
