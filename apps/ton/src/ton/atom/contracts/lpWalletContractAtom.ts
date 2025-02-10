import { Address } from '@ton/core'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { TonContext } from 'ton/context/TonContext'
import { parseAddress } from 'ton/utils/address'
import { LpWallet } from 'ton/wrappers/tact_LpWallet'

export const lpWalletContractAtom = atomFamily((contractAddress?: string | Address) => {
  return atom(() => {
    const client = TonContext.instance.getClient()
    return client.open(LpWallet.fromAddress(parseAddress(contractAddress?.toString())))
  })
}, isEqual)
