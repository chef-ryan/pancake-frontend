import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { getLpAccountAddress } from 'ton/utils/api'
import { addressAtom } from '../addressAtom'
import { chainIdAtom } from '../chainIdAtom'
import { lpAccountContractAtom } from '../contracts/lpAccountContractAtom'

interface LpAccountAtomProps {
  poolAddress?: string
}

export const lpAccountAtom = atomFamily(({ poolAddress }: LpAccountAtomProps) => {
  return atom(async (get) => {
    if (!poolAddress) return null

    const userAddress = get(addressAtom)

    const lpAccountAddress = await getLpAccountAddress(get(chainIdAtom), userAddress, poolAddress.toString())

    const lpAccount = get(lpAccountContractAtom(lpAccountAddress.toString()))

    const lpAccountData = await lpAccount.getGetLpAccountData()

    return {
      ...lpAccountData,
      lpAccountAddress,
    }
  })
}, isEqual)
