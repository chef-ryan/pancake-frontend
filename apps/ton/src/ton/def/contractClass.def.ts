import { TonContractTypes } from 'ton/ton.enums'
import { TonContractClassDef } from 'ton/ton.types'
import { FunctionDefs } from './function.def'

export const ContractClasses = {
  [TonContractTypes.JettonMinter]: {
    interfaces: [FunctionDefs.getWalletAddress],
  },
  [TonContractTypes.Jetton]: {
    interfaces: [FunctionDefs.getBalance],
  },
  [TonContractTypes.PCSRouter]: {
    interfaces: [FunctionDefs.getPoolAddress, FunctionDefs.estimateAddLiquidity],
  },
  [TonContractTypes.NATIVE]: {
    interfaces: [FunctionDefs.getBalance],
  },
  [TonContractTypes.Pool]: {
    interfaces: [FunctionDefs.getLpAccountAddress],
  },
  [TonContractTypes.LP]: {
    interfaces: [FunctionDefs.getLPAccountData],
  },
} as const satisfies Record<TonContractTypes, TonContractClassDef<unknown>>
