import { TonChainId } from '@pancakeswap/ton-v2-sdk'

const domain = {
  [TonChainId.Mainnet]: 'https://main.ton.dev',
  [TonChainId.Testnet]: 'https://testnet.toncenter.com',
}

export const TonEndPoints = {
  [TonChainId.Mainnet]: domain[TonChainId.Mainnet],
  [TonChainId.Testnet]: `${domain[TonChainId.Testnet]}/api/v2/jsonRPC?api_key=${
    process.env.NEXT_PUBLIC_TONCENTER_TESTNET_API_KEY
  }`,
}

export const traceEndPoints = {
  [TonChainId.Mainnet]: domain[TonChainId.Mainnet],
  [TonChainId.Testnet]: `${domain[TonChainId.Testnet]}/api/v3/traces?api_key=${
    process.env.NEXT_PUBLIC_TONCENTER_TESTNET_API_KEY
  }`,
}
