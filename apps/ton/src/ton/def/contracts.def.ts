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
  [TonContractNames.Router]: {
    address: 'kQDSysXTXY7_HPNaP-Rp9uNU20bFc5e0TbSA3Z77S6gLA4TD',
    type: TonContractTypes.PCSRouter,
  },
} as const satisfies Record<TonContractNames, { address: string; type: TonContractTypes }>
