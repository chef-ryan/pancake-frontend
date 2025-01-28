import { useAtomValue } from 'jotai'
import { networkAtom } from 'ton/atom/networkAtom'
import { TonChainId, TonNetworks } from 'ton/ton.enums'

export const useActiveChainId = () => {
  return { chainId: useAtomValue(networkAtom) === TonNetworks.Mainnet ? TonChainId.Mainnet : TonChainId.Testnet }
}
