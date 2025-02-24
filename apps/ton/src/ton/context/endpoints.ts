import { TonChainId } from '@pancakeswap/ton-v2-sdk'

export const TonEndPoints = {
  [TonChainId.Mainnet]: 'https://main.ton.dev',
  [TonChainId.Testnet]: `https://testnet.toncenter.com/api/v2/jsonRPC?api_key=${process.env.NEXT_PUBLIC_TONCENTER_TESTNET_API_KEY}`,
}
