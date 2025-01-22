import { Address } from '@ton/core'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { Contracts } from 'ton/def/contracts.def'
import { TonContractNames } from 'ton/ton.enums'
import { JettonHelper } from 'ton/utils/JettonHelper'

type JettonWalletQueryParams = {
  contractName: TonContractNames
  ownerAddress: Address
}
export const jettonWalletOfAtom = atomFamily(
  (params: JettonWalletQueryParams) => {
    return atom(async () => {
      const contract = Contracts[params.contractName]
      const address = Address.parse(contract.address)
      return JettonHelper.getJettonWallet(address, params.ownerAddress)
    })
  },
  (a, b) => {
    return a.contractName === b.contractName && a.ownerAddress.equals(b.ownerAddress)
  },
)
