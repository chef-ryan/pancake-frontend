import { TonChainId, TonNetworks } from '@pancakeswap/ton-v2-sdk'
import { useAtomValue } from 'jotai'
import { networkAtom } from 'ton/atom/networkAtom'

export const useActiveChainId = () => {
  return { chainId: useAtomValue(networkAtom) === TonNetworks.Mainnet ? TonChainId.Mainnet : TonChainId.Testnet }
}
