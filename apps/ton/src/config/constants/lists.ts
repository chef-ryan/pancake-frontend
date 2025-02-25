import { TonNetworks } from '@pancakeswap/ton-v2-sdk'
import { PUBLIC_BASE_URL } from './endpoints'

export const TOKEN_LIST_URLS = {
  [TonNetworks.Mainnet]: `${PUBLIC_BASE_URL}/lists/main.json`,
  [TonNetworks.Testnet]: `${PUBLIC_BASE_URL}/lists/testnet.json`,
}
