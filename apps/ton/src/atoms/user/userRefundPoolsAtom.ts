import { TonChainId } from '@pancakeswap/ton-v2-sdk'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { chainIdAtom } from 'ton/atom/chainIdAtom'
import { RefundPool } from 'types/pools'

const userRefundPoolsListAtom = atomFamily((chainId: TonChainId) => atom<RefundPool[]>([]), isEqual)
export const userRefundPoolsAtom = atom((get) => get(userRefundPoolsListAtom(get(chainIdAtom))))

export const addUserRefundPoolAtom = atom(null, (get, set, pool: RefundPool) => {
  set(userRefundPoolsListAtom(get(chainIdAtom)), [...get(userRefundPoolsListAtom(get(chainIdAtom))), pool])
})

export const updateUserRefundPoolAtom = atom(null, (get, set, pool: RefundPool) => {
  set(
    userRefundPoolsListAtom(get(chainIdAtom)),
    get(userRefundPoolsListAtom(get(chainIdAtom))).map((item) =>
      item.poolAddress === pool.poolAddress ? { ...item, ...pool } : item,
    ),
  )
})
