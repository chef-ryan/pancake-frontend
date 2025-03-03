import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { getLpWalletAddress } from 'ton/utils/api'
import { addressAtom } from '../addressAtom'
import { chainIdAtom } from '../chainIdAtom'
import { lpWalletContractAtom } from '../contracts/lpWalletContractAtom'
import { poolAddressAtom } from './poolAddressAtom'

interface LpBalanceAtomProps {
  token0Address?: string
  token1Address?: string
}

export const lpBalanceAtom = atomFamily(({ token0Address, token1Address }: LpBalanceAtomProps) => {
  return atom(async (get) => {
    const userAddress = get(addressAtom)
    if (!userAddress) return 0n

    const poolAddress = await get(poolAddressAtom({ token0Address, token1Address }))
    if (!poolAddress) return 0n

    const lpWalletAddress = await getLpWalletAddress(get(chainIdAtom), userAddress, poolAddress.toString())

    const lpWallet = get(lpWalletContractAtom(lpWalletAddress.toString()))
    return (await lpWallet.getGetWalletData()).balance ?? 0n
  })
}, isEqual)
