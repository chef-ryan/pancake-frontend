import { TonNetworks } from 'ton/ton.enums'

export const TonEndPoints = {
  // [TonNetworks.Mainnet]: 'https://attentive-warmhearted-fire.ton-mainnet.quiknode.pro/9a4ad85a1139b7d19fa1dc658547bdde9184bd4d',
  [TonNetworks.Mainnet]: 'https://main.ton.dev',
  [TonNetworks.Testnet]: `https://testnet.toncenter.com/api/v2/jsonRPC?api_key=${process.env.NEXT_PUBLIC_TONCENTER_TESTNET_API_KEY}`,
}
