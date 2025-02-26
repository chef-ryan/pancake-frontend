import { Currency } from '@pancakeswap/ton-v2-sdk'
import { Address, beginCell, Cell, storeStateInit } from '@ton/core'
import { JettonMaster } from '@ton/ton'
import { TonContext } from 'ton/context/TonContext'
import { parseAddress } from './address'

/**
 * Compute jetton wallet address offline if available, otherwise fetch from JettonMaster
 * Reference: https://docs.ton.org/v3/guidelines/dapps/cookbook#how-to-calculate-users-jetton-wallet-address-offline
 */
export const getJettonWalletAddress = async (userAddress: Address, currency: Currency) => {
  // If no jettonCode in currency, then fetch jettonWalletAddress directly from JettonMaster
  if (!currency.wrapped.jettonCode) {
    const client = TonContext.instance.getClient()
    const jettonMaster = client.open(JettonMaster.create(parseAddress(currency.wrapped.address)))
    return jettonMaster.getWalletAddress(userAddress)
  }

  const JETTON_WALLET_CODE = Cell.fromBoc(Buffer.from(currency.wrapped.jettonCode, 'hex'))[0]
  const JETTON_MASTER_ADDRESS = parseAddress(currency.wrapped.address)

  const jettonWalletStateInit = beginCell()
    .store(
      storeStateInit({
        code: JETTON_WALLET_CODE,
        data: beginCell()
          .storeCoins(0)
          .storeAddress(userAddress)
          .storeAddress(JETTON_MASTER_ADDRESS)
          .storeRef(JETTON_WALLET_CODE)
          .endCell(),
      }),
    )
    .endCell()

  const userJettonWalletAddress = new Address(0, jettonWalletStateInit.hash())
  return userJettonWalletAddress
}
