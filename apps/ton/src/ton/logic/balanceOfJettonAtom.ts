import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { TonContractNames, TonContractTypes } from '@pancakeswap/ton-v2-sdk'
import { addressAtom } from 'ton/atom/addressAtom'
import { contractOfTypeAtom } from 'ton/atom/contractOfTypeAtom'
import { Logger } from 'ton/utils/Logger'
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
        ownerAddress: userAddress,
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
