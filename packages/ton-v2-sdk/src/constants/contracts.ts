import { TonChainId, TonContractNames, TonContractTypes } from './ton.enums'

export const Contracts = {
  [TonContractNames.NATIVE]: {
    type: TonContractTypes.NATIVE,
    [TonChainId.Mainnet]: {
      address: '',
    },
    [TonChainId.Testnet]: {
      address: '',
    },
  },
  [TonContractNames.USDC]: {
    type: TonContractTypes.JettonMinter,
    [TonChainId.Mainnet]: {
      address: '',
    },
    [TonChainId.Testnet]: {
      address: 'kQA8oT-HRBY-9-yFymg17hD5FE07--Z1gYc_sZTbzqpOZr1t',
    },
  },
  [TonContractNames.USDT]: {
    type: TonContractTypes.JettonMinter,
    [TonChainId.Mainnet]: {
      address: '',
    },
    [TonChainId.Testnet]: {
      address: 'kQCHLgAWLrFnHChbETKLnUEpA_oW0_5f9SDVYc9mJtVDMXrC',
    },
  },
  [TonContractNames.CAKE]: {
    type: TonContractTypes.JettonMinter,
    [TonChainId.Mainnet]: {
      address: '',
    },
    [TonChainId.Testnet]: {
      address: 'kQA8oT-HRBY-9-yFymg17hD5FE07--Z1gYc_sZTbzqpOZr1t',
    },
  },
  [TonContractNames.PCSRouter]: {
    type: TonContractTypes.PCSRouter,
    [TonChainId.Mainnet]: {
      address: 'EQBVB6mOKLp7SxChOzegQqtum1Thiuf9ddkhl8lKtQxMMePR',
    },
    [TonChainId.Testnet]: {
      address: 'kQB-oiKteYtZu8F37inMW2NXDz0DeYNAw4tjd8wZGTUpIkJG',
    },
  },
} as const
