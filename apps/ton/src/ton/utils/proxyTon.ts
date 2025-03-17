/* eslint-disable camelcase */
import { Currency } from '@pancakeswap/ton-v2-sdk'
import { Address, beginCell, Cell, StateInit } from '@ton/core'
import { TonContext } from 'ton/context/TonContext'
import { JettonMasterUSDT } from 'ton/wrappers/tact_JettonMasterUSDT'

export async function getProxyTonStateInit(userAddress: Address, currency: Currency) {
  try {
    if (!currency.isNative) throw new Error('Only native tokens are supported for pTON state init')

    const tokenAddress = Address.parse(currency.wrapped.address)

    let code: Cell

    if (currency.wrapped.jettonCode) {
      code = Cell.fromBoc(Buffer.from(currency.wrapped.jettonCode, 'hex'))[0]
    } else {
      const client = TonContext.instance.getClient()

      const jettonMaster = client.open(JettonMasterUSDT.fromAddress(tokenAddress))

      const { jetton_wallet_code } = await jettonMaster.getGetJettonData()
      code = jetton_wallet_code
    }

    // Cell Structure is specific to ProxyTon
    const data: Cell = beginCell().storeCoins(0).storeAddress(userAddress).storeAddress(tokenAddress).endCell()

    return { data, code } as StateInit
  } catch (error) {
    console.error('Failed to get ProxyTon state init', error)
    throw new Error(`Failed to get ProxyTon state init: ${error}`)
  }
}
