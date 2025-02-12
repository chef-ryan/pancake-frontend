import { TonContractNames } from '@pancakeswap/ton-v2-sdk'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { contractAtom } from 'ton/atom/contractAtom'

type JettonWalletQueryParams = {
  contractName: TonContractNames
  ownerAddress: string
}
export const jettonWalletOfAtom = atomFamily((params: JettonWalletQueryParams) => {
  return atom(async (get) => {
    const contract = get(contractAtom(params.contractName))
    const address = await contract.getWalletAddress(params.ownerAddress)
    return address
  })
}, isEqual)
