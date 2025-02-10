import { Address } from '@ton/core'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { TonContext } from 'ton/context/TonContext'
import { parseAddress } from 'ton/utils/address'
import { LpAccount } from 'ton/wrappers/tact_LpAccount'

export const lpAccountContractAtom = atomFamily((contractAddress?: string | Address) => {
  return atom(() => {
    const client = TonContext.instance.getClient()
    return client.open(LpAccount.fromAddress(parseAddress(contractAddress?.toString())))
  })
}, isEqual)
