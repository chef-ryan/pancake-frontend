import { TonContractNames, TonContractTypes, TonNetworks } from 'ton/ton.enums'

export const Contracts = {
  [TonContractNames.NATIVE]: {
    type: TonContractTypes.NATIVE,
    [TonNetworks.Mainnet]: {
      address: '',
    },
    [TonNetworks.Testnet]: {
      address: '',
    },
  },
  [TonContractNames.USDC]: {
    type: TonContractTypes.JettonMinter,
    [TonNetworks.Mainnet]: {
      address: '',
    },
    [TonNetworks.Testnet]: {
      address: 'kQA8oT-HRBY-9-yFymg17hD5FE07--Z1gYc_sZTbzqpOZr1t',
    },
  },
  [TonContractNames.CAKE]: {
    type: TonContractTypes.JettonMinter,
    [TonNetworks.Mainnet]: {
      address: '',
    },
    [TonNetworks.Testnet]: {
      address: 'kQA8oT-HRBY-9-yFymg17hD5FE07--Z1gYc_sZTbzqpOZr1t',
    },
  },
  [TonContractNames.PCSRouter]: {
    type: TonContractTypes.PCSRouter,
    [TonNetworks.Mainnet]: {
      address: '',
    },
    [TonNetworks.Testnet]: {
      address: 'kQB-oiKteYtZu8F37inMW2NXDz0DeYNAw4tjd8wZGTUpIkJG',
      // address: 'kQA8fEASOX1UJ9bDwGCneGKrrOy7qIucg8G5x5me7aY5yhRi', // OLD Router
    },
  },
} as const
