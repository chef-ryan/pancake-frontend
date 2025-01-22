import { Address } from '@ton/core'
import { ContractProxy } from 'ton/context/ContractProxy'
import type { ContractClasses } from 'ton/def/contractClass.def'
import { Contracts } from 'ton/def/contracts.def'
import { TonContractNames, TonContractTypes } from 'ton/ton.enums'
import { TonContractInstance } from 'ton/ton.types'

type TClasses = typeof ContractClasses
type TContracts = typeof Contracts
type TypeOfName<TName extends TonContractNames> = TContracts[TName]['type']

const contractCache = new Map<string, TonContractInstance<any>>()

export class ContractFactory {
  public static getContract<TName extends TonContractNames>(
    name: TName,
  ): TonContractInstance<TClasses[TypeOfName<TName>]>

  public static getContract<TType extends TonContractTypes>(
    type: TType,
    address: string | Address,
  ): TonContractInstance<TClasses[TType]>

  public static getContract<TType extends TonContractTypes>(
    initialType: TonContractTypes | TonContractNames,
    initialAddress?: string | Address,
  ) {
    let resolvedType = initialType
    let resolvedAddress = initialAddress

    // If no address is provided, get from Contracts
    if (!resolvedAddress) {
      const { address, type } = Contracts[initialType]
      resolvedAddress = address
      resolvedType = type
    }

    // Now ensure TS knows it isn't undefined
    if (!resolvedAddress) {
      throw new Error(`Could not resolve an address for "${resolvedType}".`)
    }

    // From here on, resolvedAddress is guaranteed non-undefined
    const hash = `${resolvedType}:${resolvedAddress.toString()}`

    if (contractCache.has(hash)) {
      return contractCache.get(hash) as TonContractInstance<TClasses[TType]>
    }

    const proxy = new ContractProxy(resolvedType as TType, resolvedAddress.toString())
    const instance = new Proxy({}, proxy) as TonContractInstance<TClasses[TType]>

    contractCache.set(hash, instance)
    return instance
  }
}
