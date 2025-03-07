import { toNano } from '@ton/core'

export const GAS_CONSTANTS = {
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
  provideLpJetton: {
    gasAmount: toNano('0.3'),
    forwardGasAmount: toNano('0.235'),
  },
  provideLpTon: {
    forwardGasAmount: toNano('0.3'),
  },
  singleSideProvideLpJetton: {
    gasAmount: toNano('1'),
    forwardGasAmount: toNano('0.8'),
  },
  singleSideProvideLpTon: {
    forwardGasAmount: toNano('0.8'),
  },
}
