import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { TonContractNames } from 'ton/ton.enums'
import { Logger } from 'ton/utils/Logger'
import { balanceOfJettonAtom } from './balanceOfJettonAtom'
import { balanceOfNativeAtom } from './balanceOfNativeAtom'

const logger = Logger.getLogger('balanceOfAtom')
export const balanceOfAtom = atomFamily((contract: TonContractNames) => {
  return atom(async (get) => {
    if (contract === TonContractNames.NATIVE) {
      return get(balanceOfNativeAtom)
    }
    return get(balanceOfJettonAtom(contract))
  })
}, isEqual)
