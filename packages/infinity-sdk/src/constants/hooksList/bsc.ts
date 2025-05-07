import { ChainId } from '@pancakeswap/chains'

import { HOOK_CATEGORY, HookType, POOL_TYPE, type HookData, type PoolType } from '../../types'
import { CL_DYNAMIC_FEE_HOOKS_BY_CHAIN } from './dynamicFeeHook'

export const CL_DYNAMIC_HOOK: HookData = {
  address: CL_DYNAMIC_FEE_HOOKS_BY_CHAIN[ChainId.BSC],
  name: 'Dynamic Fees (CLAMM)',
  poolType: POOL_TYPE.CLAMM,
  description:
    'PancakeSwap’s Dynamic Fee Hook adjusts swap fees based on market volatility—penalizing arbitrageurs and rewarding LPs during turbulence, while keeping fees low in stable conditions for smoother trading.',
  github: 'https://github.com/pancakeswap/',
  learnMoreLink: 'https://docs.pancakeswap.finance/trade/pancakeswap-infinity/hooks/dynamic-fee-hook',
  category: [HOOK_CATEGORY.DynamicFees],
  isVerified: false,
  isUpgradable: false,
  creator: 'https://github.com/pancakeswap/',
  defaultFee: 500,
  hooksRegistration: {
    afterInitialize: true,
    beforeSwap: true,
    afterSwap: true,
  },
  hookType: HookType.Universal,
}

// const BIN_DYNAMIC_HOOK = {
//   address: BIN_DYNAMIC_FEE_HOOKS_BY_CHAIN[ChainId.BSC],
//   name: 'Dynamic Fees (Bin)',
//   poolType: POOL_TYPE.Bin,
//   description: 'It will set lpFee to 3000 i.e 0.3% in afterInitialize',
//   github: 'https://bscscan.com/address/0x870c167eFCEEaDd081EE783Af8c5c7b436f1d3Ce',
//   category: [HOOK_CATEGORY.DynamicFees],
//   isVerified: true,
//   isUpgradable: false,
//   hooksRegistration: {
//     afterInitialize: true,
//     beforeAddLiquidity: true,
//     beforeSwap: true,
//   },
// }
// const BIN_DYNAMIC_HOOK = undefined

const dynamicHooksList: HookData[] = [CL_DYNAMIC_HOOK]

export const bscHooksList: HookData[] = [
  ...dynamicHooksList,
  {
    // cake-usdt
    poolType: POOL_TYPE.CLAMM,
    address: '0x1a3dfbcac585e22f993cc8e09bcc0db388cc1ca3',
    name: 'CAKE Holder Discount Hook (Brevis)',
    description: `Powered by Brevis, this hook enables swap fee discounts for CAKE holders who have made at least 1 swap in this pool in the last 30 days. The fee discount tier is based on a user’s last 30-day Time-Weighted Average (TWA) CAKE balance: 
(VIP 1) 5% discount if 100 CAKE < TWA <= 1,000 CAKE, 
(VIP 2) 15% discount if 1,000 CAKE < TWA <= 10,000 CAKE,
(VIP 3) 25% discount if 10,000 CAKE < TWA <= 20,000 CAKE,
(VIP 4) 35% discount if 20,000 CAKE < TWA <= 30,000 CAKE, 
(VIP 5) 45% discount if TWA > 30,000 CAKE.
    `,
    github: 'https://github.com/brevis-network/pancake-tokenholding-hook/tree/main',
    category: [HOOK_CATEGORY.Oracle, HOOK_CATEGORY.JIT, HOOK_CATEGORY.Others, HOOK_CATEGORY.DynamicFees],
    creator: 'https://github.com/brevis-network',
    audit: '',
    isVerified: false,
    isUpgradable: true,
    hooksRegistration: {
      beforeSwap: true,
    },
    hookType: HookType.PerPool,
    defaultFee: 2500,
  },
  {
    // USDT-USDC
    poolType: POOL_TYPE.CLAMM,
    address: '0x1e9c64cad39ddd36fb808e004067cffc710eb71d',
    name: 'VIP discount Hook (Brevis)',
    description: `Powered by Brevis, this hook enables swap fee discounts for VIP traders based on their cumulative trading volume in this pool in the last 30 days:
(VIP 1) 5% discount if 50,000 USDT < 30-Day Volume <= 1,000,000 USDT, 
(VIP 2) 15% discount if 1,000,000 USDT < 30-Day Volume <= 5,000,000 USDT,
(VIP 3) 25% discount if 5,000,000 USDT < 30-Day Volume <= 15,000,000 USDT,
(VIP 4) 35% discount if 15,000,000 USDT < 30-Day Volume <= 20,000,000 USDT,
(VIP 5) 45% discount if 30-Day Volume > 20,000,000 USDT.
    `,
    github: 'https://github.com/brevis-network/pancake-tokenholding-hook/tree/main',
    category: [HOOK_CATEGORY.Oracle, HOOK_CATEGORY.JIT, HOOK_CATEGORY.Others, HOOK_CATEGORY.DynamicFees],
    creator: 'https://github.com/brevis-network',
    audit: '',
    isVerified: false,
    isUpgradable: true,
    hooksRegistration: {
      beforeSwap: true,
    },
    hookType: HookType.PerPool,
    defaultFee: 100,
  },
  {
    // ETH-USDT
    poolType: POOL_TYPE.CLAMM,
    address: '0xf27b9134b23957d842b08ffa78b07722fb9845bd',
    name: 'VIP discount Hook (Brevis)',
    description: `Powered by Brevis, this hook enables swap fee discounts for VIP traders based on their cumulative trading volume in this pool in the last 30 days:
(VIP 1) 5% discount if 28 ETH < 30-Day Volume <= 555 ETH, 
(VIP 2) 15% discount if 555 ETH < 30-Day Volume <= 2,778 ETH,
(VIP 3) 25% discount if 2,778 ETH < 30-Day Volume <= 8,333 ETH,
(VIP 4) 35% discount if 8,333 ETH < 30-Day Volume <= 11,111 ETH,
(VIP 5) 45% discount if 30-Day Volume > 11,111 ETH.
    `,
    github: 'https://github.com/brevis-network/pancake-tokenholding-hook/tree/main',
    category: [HOOK_CATEGORY.Oracle, HOOK_CATEGORY.JIT, HOOK_CATEGORY.Others, HOOK_CATEGORY.DynamicFees],
    creator: 'https://github.com/brevis-network',
    audit: '',
    isVerified: false,
    isUpgradable: true,
    hooksRegistration: {
      beforeSwap: true,
    },
    hookType: HookType.PerPool,
    defaultFee: 500,
  },
  {
    // BNB-USDT
    poolType: POOL_TYPE.Bin,
    address: '0x60fbcafab24bc117b6facecd00d3e8f56ca4d5e9',
    name: 'CAKE Holder Discount Hook (Brevis)',
    description: `Powered by Brevis, this hook enables swap fee discounts for CAKE holders who have made at least 1 swap in this pool in the last 30 days. The fee discount tier is based on a user’s last 30-day Time-Weighted Average (TWA) CAKE balance: 
(VIP 1) 5% discount if 100 CAKE < TWA <= 1,000 CAKE, 
(VIP 2) 15% discount if 1,000 CAKE < TWA <= 10,000 CAKE,
(VIP 3) 25% discount if 10,000 CAKE < TWA <= 20,000 CAKE,
(VIP 4) 35% discount if 20,000 CAKE < TWA <= 30,000 CAKE, 
(VIP 5) 45% discount if TWA > 30,000 CAKE.
    `,
    github: 'https://github.com/brevis-network/pancake-tokenholding-hook/tree/main',
    category: [HOOK_CATEGORY.Oracle, HOOK_CATEGORY.JIT, HOOK_CATEGORY.Others, HOOK_CATEGORY.DynamicFees],
    creator: 'https://github.com/brevis-network',
    audit: '',
    isVerified: false,
    isUpgradable: true,
    hooksRegistration: {
      beforeSwap: true,
    },
    hookType: HookType.PerPool,
    defaultFee: 500,
  },
  {
    // BTCB-BNB
    address: '0x0fcf6d110cf96be56d251716e69e37619932edf2',
    name: 'CAKE Holder Discount Hook (Brevis)',
    description: `Powered by Brevis, this hook enables swap fee discounts for CAKE holders who have made at least 1 swap in this pool in the last 30 days. The fee discount tier is based on a user’s last 30-day Time-Weighted Average (TWA) CAKE balance: 
(VIP 1) 5% discount if 100 CAKE < TWA <= 1,000 CAKE, 
(VIP 2) 15% discount if 1,000 CAKE < TWA <= 10,000 CAKE,
(VIP 3) 25% discount if 10,000 CAKE < TWA <= 20,000 CAKE,
(VIP 4) 35% discount if 20,000 CAKE < TWA <= 30,000 CAKE, 
(VIP 5) 45% discount if TWA > 30,000 CAKE.
    `,
    github: 'https://github.com/brevis-network/pancake-tokenholding-hook/tree/main',
    category: [HOOK_CATEGORY.Oracle, HOOK_CATEGORY.JIT, HOOK_CATEGORY.Others, HOOK_CATEGORY.DynamicFees],
    creator: 'https://github.com/brevis-network',
    audit: '',
    isVerified: false,
    isUpgradable: true,
    hooksRegistration: {
      beforeSwap: true,
    },
    hookType: HookType.PerPool,
    defaultFee: 500,
  },
  {
    // CAKE-BNB
    address: '0xdfdfb2c5a717ab00b370e883021f20c2fbaed277',
    name: 'CAKE Holder Discount Hook (Brevis)',
    description: `Powered by Brevis, this hook enables swap fee discounts for CAKE holders who have made at least 1 swap in this pool in the last 30 days. The fee discount tier is based on a user’s last 30-day Time-Weighted Average (TWA) CAKE balance: 
(VIP 1) 5% discount if 100 CAKE < TWA <= 1,000 CAKE, 
(VIP 2) 15% discount if 1,000 CAKE < TWA <= 10,000 CAKE,
(VIP 3) 25% discount if 10,000 CAKE < TWA <= 20,000 CAKE,
(VIP 4) 35% discount if 20,000 CAKE < TWA <= 30,000 CAKE, 
(VIP 5) 45% discount if TWA > 30,000 CAKE.
    `,
    github: 'https://github.com/brevis-network/pancake-tokenholding-hook/tree/main',
    category: [HOOK_CATEGORY.Oracle, HOOK_CATEGORY.JIT, HOOK_CATEGORY.Others, HOOK_CATEGORY.DynamicFees],
    creator: 'https://github.com/brevis-network',
    audit: '',
    isVerified: false,
    isUpgradable: true,
    hooksRegistration: {
      beforeSwap: true,
    },
    hookType: HookType.PerPool,
    defaultFee: 2500,
  },
]

/**
 * Dynamic hook for each pool type for auto-selection on "Dynamic" fee tier
 */
export const bscDynamicHooks: Record<PoolType, HookData | undefined> = {
  CL: CL_DYNAMIC_HOOK,
  Bin: undefined,
}
