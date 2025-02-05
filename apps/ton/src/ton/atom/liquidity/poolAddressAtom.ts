import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { routerContractAtom } from 'ton/atom/contracts/routerContractAtom'
import { parseAddress } from 'ton/utils/address'
import { jettonMasterContractAtom } from '../contracts/jettonMasterContractAtom'

interface PoolAddressAtomParams {
  token0Address?: string
  token1Address?: string
}
export const poolAddressAtom = atomFamily(({ token0Address, token1Address }: PoolAddressAtomParams) => {
  return atom(async (get) => {
    if (!token0Address || !token1Address) return null

    const router = get(routerContractAtom)
    const jettonMaster0 = get(jettonMasterContractAtom(token0Address))
    const jettonMaster1 = get(jettonMasterContractAtom(token1Address))

    const [jettonWalletAddress0, jettonWalletAddress1] = await Promise.all([
      jettonMaster0.getGetWalletAddress(parseAddress(router.address.toString())),
      jettonMaster1.getGetWalletAddress(parseAddress(router.address.toString())),
    ])

    return router.getGetPoolAddress(jettonWalletAddress0, jettonWalletAddress1)
  })
}, isEqual)
