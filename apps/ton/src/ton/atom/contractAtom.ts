import { atom } from 'jotai'
import { ContractClasses } from 'ton/def/contractClass.def'
import { Contracts, TonContractNames, TonContractInstance } from '@pancakeswap/ton-v2-sdk'

import { contractOfTypeAtom } from './contractOfTypeAtom'
import { networkAtom } from './networkAtom'

type TClasses = typeof ContractClasses
type TContracts = typeof Contracts
export const contractAtom = function contractAtom<TName extends TonContractNames>(name: TName) {
  return atom<TonContractInstance<TClasses[TContracts[TName]['type']]>>((get) => {
    const network = get(networkAtom)
    const { type } = Contracts[name]
    const { address } = Contracts[name][network]

    const proxy = get(
      contractOfTypeAtom({
        type,
        address,
      }),
    )

    return proxy as unknown as TonContractInstance<TClasses[TContracts[TName]['type']]>
  })
}
