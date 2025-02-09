import { Address } from '@ton/core'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { TonContext } from 'ton/context/TonContext'
import { parseAddress } from 'ton/utils/address'
import { Pool } from 'ton/wrappers/tact_Pool'

export const poolContractAtom = atomFamily((poolAddress?: string | Address) => {
  return atom(() => {
    const client = TonContext.instance.getClient()
    return client.open(Pool.fromAddress(parseAddress(poolAddress?.toString())))
  })
}, isEqual)
