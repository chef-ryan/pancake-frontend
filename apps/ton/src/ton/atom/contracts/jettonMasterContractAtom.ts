import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { TonContext } from 'ton/context/TonContext'
import { parseAddress } from 'ton/utils/address'
import { JettonMasterUSDT } from 'ton/wrappers/tact_JettonMasterUSDT'

export const jettonMasterContractAtom = atomFamily((tokenAddress: string) => {
  return atom(() => {
    const client = TonContext.instance.getClient()
    return client.open(JettonMasterUSDT.fromAddress(parseAddress(tokenAddress)))
  })
}, isEqual)
