import { Address } from '@ton/core'
import { atom, Atom } from 'jotai'
import { ContractClasses } from 'ton/def/contractClass.def'
import { TonContractTypes } from 'ton/ton.enums'
import { TonContractInstance } from 'ton/ton.types'
import { ContractFactory } from 'ton/utils/ContractFactory'

type TClasses = typeof ContractClasses
interface Params<TType extends TonContractTypes> {
  type: TType
  address: Address
}

const cache = new Map<string, any>()
export const contractOfTypeAtom = function contractAtom<TType extends TonContractTypes>(params: Params<TType>) {
  const key = `${params.type}_${params.address.toString()}`
  if (cache.has(key)) {
    return cache.get(key) as Atom<TonContractInstance<TClasses[TType]>>
  }
  const valueAtom = atom<TonContractInstance<TClasses[TType]>>(() => {
    return ContractFactory.getContract(params.type, params.address)
  })
  cache.set(key, valueAtom)
  return valueAtom
}
