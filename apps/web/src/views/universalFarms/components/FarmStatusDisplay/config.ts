import { ChainId } from '@pancakeswap/chains'
import { RewardProvider, RewardConfig } from './types'

export const rewardConfig: Record<ChainId, RewardConfig[]> = {
  [ChainId.BSC]: [
    {
      poolAddress: '0xdc35157217A3AeFF3dcaF2e86327254FBF9f4601',
      rewardProvider: RewardProvider.Ethena,
      multiplier: 30,
    },
    {
      poolAddress: '0x345E7D44E1eb8894b4524Cfc918906718bc1FFe2',
      rewardProvider: RewardProvider.Ethena,
      multiplier: 30,
    },
    {
      poolAddress: '0xe38b4d4dc90e6a0859bee047689d97db7fd94621',
      rewardProvider: RewardProvider.Falcon,
      multiplier: 60,
    },
    {
      poolAddress: '0x24618d12b5eA15bB6fe3c81bBb9E011b5D5b107c',
      rewardProvider: RewardProvider.Falcon,
      multiplier: 50,
    },
  ],
  [ChainId.ETHEREUM]: [
    {
      poolAddress: '0x0d9EA0D5E3f400b1df8F695be04292308c041E77',
      rewardProvider: RewardProvider.Falcon,
      multiplier: 40,
    },
  ],
}
