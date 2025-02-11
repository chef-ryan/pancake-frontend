import { TonContractTypes } from '@pancakeswap/ton-v2-sdk'
import { getBalance, getWalletAddress } from './function.def'

export const ContractClasses = {
  [TonContractTypes.JettonMinter]: {
    interfaces: [getWalletAddress],
  },
  [TonContractTypes.Jetton]: {
    interfaces: [getBalance],
  },
  [TonContractTypes.PCSRouter]: {
    interfaces: [],
  },
  [TonContractTypes.NATIVE]: {
    interfaces: [getBalance],
  },
} as const
