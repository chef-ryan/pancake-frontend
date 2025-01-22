import type { TonFunctionDef } from 'ton/ton.types'

export const FunctionDefs = {
  getWalletAddress: {
    method: 'getWalletAddress',
    inputs: [
      {
        name: 'owner',
        type: 'address',
      },
    ],
    outputs: [
      {
        type: 'address',
      },
    ],
  },

  getBalance: {
    method: 'getBalance',
    inputs: [],
    outputs: [
      {
        type: 'int',
      },
    ],
    defaultValue: null,
  },

  getPoolAddress: {
    method: 'getPoolAddress',
    inputs: [
      {
        name: 'jettonWallet0',
        type: 'address',
      },
      {
        name: 'jettonWallet1',
        type: 'address',
      },
    ],
    outputs: [
      {
        type: 'address',
      },
    ],
    defaultValue: null,
  },

  getLpAccountAddress: {
    method: 'getLpAccountAddress',
    inputs: [
      {
        name: 'userAddress',
        type: 'address',
      },
    ],
    outputs: [
      {
        type: 'address',
      },
    ],
    defaultValue: null,
  },

  getLPAccountData: {
    method: 'getLPAccountData',
    inputs: [],
    outputs: [
      {
        type: 'int',
      },
      {
        type: 'int',
      },
    ],
  },

  estimateAddLiquidity: {
    method: 'estimateAddLiquidity',
    inputs: [
      {
        name: 'fwdFee',
        type: 'int',
      },
    ],
    outputs: [
      {
        type: 'int',
      },
    ],
  },
} as const satisfies Record<string, TonFunctionDef<unknown>>
/*
export const getWalletAddress = {
  method: 'getWalletAddress',
  inputs: [
    {
      name: 'owner',
      type: 'address',
    },
  ],
  outputs: [
    {
      type: 'address',
    },
  ],
} as const satisfies TonFunctionDef<never>

export const getBalance = {
  method: 'getBalance',
  inputs: [],
  outputs: [
    {
      type: 'int',
    },
  ],
  defaultValue: null,
} as const satisfies TonFunctionDef<null>

export const getPoolAddress = {
  method: 'getPoolAddress',
  inputs: [
    {
      name: 'jettonWallet0',
      type: 'address',
    },
    {
      name: 'jettonWallet1',
      type: 'address',
    },
  ],
  outputs: [
    {
      type: 'address',
    },
  ],
  defaultValue: null,
} as const satisfies TonFunctionDef<null>

*/
