import { atom } from 'jotai'
import { TonContext } from 'ton/context/TonContext'
import { Contracts } from 'ton/def/contracts.def'
import { TonContractNames } from 'ton/ton.enums'
import { parseAddress } from 'ton/utils/address'
import { Router } from 'ton/wrappers/tact_Router'
import { networkAtom } from '../networkAtom'

export const routerContractAtom = atom((get) => {
  const network = get(networkAtom)

  const client = TonContext.instance.getClient()
  const { address } = Contracts[TonContractNames.PCSRouter][network]

  return client.open(Router.fromAddress(parseAddress(address)))
})
