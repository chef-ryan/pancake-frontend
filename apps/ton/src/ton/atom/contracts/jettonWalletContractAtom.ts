import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { TonContext } from 'ton/context/TonContext'
import { parseAddress } from 'ton/utils/address'
import { JettonWalletUSDT } from 'ton/wrappers/tact_JettonWalletUSDT'

export const jettonWalletContractAtom = atomFamily((address: string) => {
  return atom(() => {
    const client = TonContext.instance.getClient()
    return client.open(JettonWalletUSDT.fromAddress(parseAddress(address)))
  })
}, isEqual)
