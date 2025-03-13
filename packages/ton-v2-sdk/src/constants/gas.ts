import { toNano } from '@ton/core'
import { TonChainId } from './ton.enums'

export const GAS_CONSTANTS = {
  [TonChainId.Testnet]: {
    swapJettonToJetton: {
      gasAmount: toNano('0.36'),
      forwardGasAmount: toNano('0.3'),
    },
    swapJettonToTon: {
      gasAmount: toNano('0.36'),
      forwardGasAmount: toNano('0.3'),
    },
    swapTonToJetton: {
      forwardGasAmount: toNano('0.3'),
    },
    provideLp: {
      gasAmount: toNano('0.3'),
      forwardGasAmount: toNano('0.235'),
    },
    removeLp: {
      gasAmount: toNano('0.5'),
    },
  },
  [TonChainId.Mainnet]: {
    swapJettonToJetton: {
      gasAmount: toNano('0.36'),
      forwardGasAmount: toNano('0.3'),
    },
    swapJettonToTon: {
      gasAmount: toNano('0.36'),
      forwardGasAmount: toNano('0.3'),
    },
    swapTonToJetton: {
      forwardGasAmount: toNano('0.3'),
    },
    provideLp: {
      gasAmount: toNano('0.3'),
      forwardGasAmount: toNano('0.235'),
    },
    removeLp: {
      gasAmount: toNano('0.3'),
    },
  },
}
