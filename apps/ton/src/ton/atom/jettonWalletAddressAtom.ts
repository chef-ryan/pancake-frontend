import { Address, JettonMaster } from '@ton/ton'
import { atom, useAtomValue } from 'jotai'
import { atomFamily, loadable } from 'jotai/utils'
import { TonContext } from 'ton/context/TonContext'
import { parseAddress } from 'ton/utils/address'

export const jettonWalletAddressAtom = atomFamily(
  (params: { tokenAddress: Address; owner: Address }) => {
    return atom(async () => {
      try {
        const client = TonContext.instance.getClient()
        const jettonMaster = client.open(JettonMaster.create(params.tokenAddress))
        return await jettonMaster.getWalletAddress(params.owner)
      } catch (e) {
        return undefined
      }
    })
  },
  (a, b) => a.tokenAddress.equals(b.tokenAddress) && a.owner.equals(b.owner),
)

// export const getJettonWalletAddress = async (
//   tokenAddress: Address | string | undefined,
//   owner: Address | string | undefined,
// ): Promise<Address | undefined> => {
//   const walletAtom = jettonWalletAddressAtom({
//     tokenAddress: Address.isAddress(tokenAddress) ? tokenAddress : parseAddress(tokenAddress),
//     owner: Address.isAddress(owner) ? owner : parseAddress(owner),
//   })
//   return atomStore.get(walletAtom)
// }

export const useJettonWalletAddress = (
  tokenAddress: Address | string | undefined,
  owner: Address | string | undefined,
) => {
  const state = useAtomValue(
    loadable(
      jettonWalletAddressAtom({
        tokenAddress: Address.isAddress(tokenAddress) ? tokenAddress : parseAddress(tokenAddress),
        owner: Address.isAddress(owner) ? owner : parseAddress(owner),
      }),
    ),
  )
  if (state.state === 'hasData') {
    return state.data
  }
  return undefined
}
