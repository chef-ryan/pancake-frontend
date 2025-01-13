import { atom } from 'jotai'
import { ContractProxy } from 'ton/context/ContractProxy'
import { ContractClasses } from 'ton/def/contractClass.def'
import { Contracts } from 'ton/def/contracts.def'
import { TonContractTypes } from 'ton/ton.enums'
import { TonContractInstance } from 'ton/ton.types'

type TClasses = typeof ContractClasses
type TContracts = typeof Contracts
interface Params<TType extends TonContractTypes> {
  type: TType
  address: string
}
export const contractOfTypeAtom = function contractOfTypeAtom<TType extends TonContractTypes>(params: Params<TType>) {
  return atom<TonContractInstance<TClasses[TType]>>(() => {
    const proxy = new ContractProxy(params.type, params.address)
    return new Proxy({}, proxy) as unknown as TonContractInstance<TClasses[TType]>
  })
}
