import { Contracts, TonContractInstance, TonContractNames } from '@pancakeswap/ton-v2-sdk'
import { atom } from 'jotai'
import { ContractClasses } from 'ton/def/contractClass.def'

import { chainIdAtom } from './chainIdAtom'
import { contractOfTypeAtom } from './contractOfTypeAtom'

type TClasses = typeof ContractClasses
type TContracts = typeof Contracts
export const contractAtom = function contractAtom<TName extends TonContractNames>(name: TName) {
  return atom<TonContractInstance<TClasses[TContracts[TName]['type']]>>((get) => {
    const chainId = get(chainIdAtom)
    const { type } = Contracts[name]
    const { address } = Contracts[name][chainId]

    const proxy = get(
      contractOfTypeAtom({
        type,
        address,
      }),
    )

    return proxy as unknown as TonContractInstance<TClasses[TContracts[TName]['type']]>
  })
}
