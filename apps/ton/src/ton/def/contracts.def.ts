import { TonContractNames, TonContractTypes } from 'ton/ton.enums'

export const Contracts = {
  [TonContractNames.NATIVE]: {
    address: '',
    type: TonContractTypes.NATIVE,
  },
  [TonContractNames.USDC]: {
    address: 'kQA8oT-HRBY-9-yFymg17hD5FE07--Z1gYc_sZTbzqpOZr1t',
    type: TonContractTypes.JettonMinter,
  },
  [TonContractNames.CAKE]: {
    address: 'kQA8oT-HRBY-9-yFymg17hD5FE07--Z1gYc_sZTbzqpOZr1t',
    type: TonContractTypes.JettonMinter,
  },
  [TonContractNames.PCSRouter]: {
    address: 'kQB-oiKteYtZu8F37inMW2NXDz0DeYNAw4tjd8wZGTUpIkJG',
    // address: 'kQA8fEASOX1UJ9bDwGCneGKrrOy7qIucg8G5x5me7aY5yhRi',
    type: TonContractTypes.PCSRouter,
  },
} as const
