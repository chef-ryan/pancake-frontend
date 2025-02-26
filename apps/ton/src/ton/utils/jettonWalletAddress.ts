import { Currency } from '@pancakeswap/ton-v2-sdk'
import { Address, beginCell, Cell, storeStateInit } from '@ton/core'
import { JettonMaster } from '@ton/ton'
import { TonContext } from 'ton/context/TonContext'
import { parseAddress } from './address'

/**
 * Compute jetton wallet address offline if available, otherwise fetch from JettonMaster
 * Reference: https://docs.ton.org/v3/guidelines/dapps/cookbook#how-to-calculate-users-jetton-wallet-address-offline
 * @param userAddress - User or Contract address (Example: Router)
 * @param currency - Currency object or address of currency
 * @returns Jetton wallet address of user
 */
export const getJettonWalletAddress = async (userAddress: string, currency: Currency | string) => {
  const USER_ADDRESS = parseAddress(userAddress)

  // If no jettonCode in currency, then fetch jettonWalletAddress directly from JettonMaster
  if (typeof currency === 'string' || !currency.wrapped.jettonCode) {
    const client = TonContext.instance.getClient()
    const jettonMaster = client.open(
      JettonMaster.create(parseAddress(typeof currency === 'string' ? currency : currency.wrapped.address)),
    )
    return jettonMaster.getWalletAddress(USER_ADDRESS)
  }

  const JETTON_WALLET_CODE = Cell.fromBoc(Buffer.from(currency.wrapped.jettonCode, 'hex'))[0]
  const JETTON_MASTER_ADDRESS = parseAddress(currency.wrapped.address)

  const jettonWalletStateInit = beginCell()
    .store(
      storeStateInit({
        code: JETTON_WALLET_CODE,
        data: beginCell()
          .storeCoins(0)
          .storeAddress(USER_ADDRESS)
          .storeAddress(JETTON_MASTER_ADDRESS)
          .storeRef(JETTON_WALLET_CODE)
          .endCell(),
      }),
    )
    .endCell()

  const userJettonWalletAddress = new Address(0, jettonWalletStateInit.hash())
  return userJettonWalletAddress
}
