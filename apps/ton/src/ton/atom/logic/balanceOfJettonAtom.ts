import { Address } from '@ton/core'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { TonContractNames, TonContractTypes } from 'ton/ton.enums'
import { Logger } from 'ton/utils/Logger'
import { addressAtom } from '../context/addressAtom'
import { contractOfTypeAtom } from '../context/contractOfTypeAtom'
import { jettonWalletOfAtom } from './jettonWalletOfAtom'

const logger = Logger.getLogger('balanceOfAtom')
export const balanceOfJettonAtom = atomFamily((contract: TonContractNames) => {
  return atom(async (get) => {
    const userAddress = get(addressAtom)

    if (!userAddress) {
      return 0
    }

    const jettonAddress = await get(
      jettonWalletOfAtom({
        contractName: contract,
        ownerAddress: Address.parse(userAddress),
      }),
    )

    const jettonContract = get(
      contractOfTypeAtom({
        type: TonContractTypes.Jetton,
        address: jettonAddress,
      }),
    )
    const balance = await jettonContract.getBalance()
    return balance
  })
}, isEqual)
