import { TonChainId } from '@pancakeswap/ton-v2-sdk'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { chainIdAtom } from 'ton/atom/chainIdAtom'
import { CombinedPoolData } from 'types/pools'

const userPoolsListAtom = atomFamily((chainId: TonChainId) => atom<CombinedPoolData[]>([]), isEqual)
export const userPoolsAtom = atom((get) => get(userPoolsListAtom(get(chainIdAtom))))

export const addUserPoolAtom = atom(null, (get, set, pool: CombinedPoolData) => {
  set(userPoolsListAtom(get(chainIdAtom)), [...get(userPoolsListAtom(get(chainIdAtom))), pool])
})

export const updateUserPoolAtom = atom(null, (get, set, pool: CombinedPoolData) => {
  set(
    userPoolsListAtom(get(chainIdAtom)),
    get(userPoolsListAtom(get(chainIdAtom))).map((item) =>
      item.poolAddress === pool.poolAddress ? { ...item, ...pool } : item,
    ),
  )
})
