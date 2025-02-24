import { Contracts, TonContractNames } from '@pancakeswap/ton-v2-sdk'
import { atom } from 'jotai'
import { TonContext } from 'ton/context/TonContext'
import { parseAddress } from 'ton/utils/address'
import { Router } from 'ton/wrappers/tact_Router'
import { chainIdAtom } from '../chainIdAtom'

export const routerContractAtom = atom((get) => {
  const chainId = get(chainIdAtom)

  const client = TonContext.instance.getClient()
  const { address } = Contracts[TonContractNames.PCSRouter][chainId]

  return client.open(Router.fromAddress(parseAddress(address)))
})
