import { TonChainId } from '@pancakeswap/ton-v2-sdk'
import { atom } from 'jotai'
import { atomFamily, atomWithStorage } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { chainIdAtom } from 'ton/atom/chainIdAtom'
import { CombinedPoolData, InitialPoolData } from 'types/pools'

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

const cachedUserPoolsListAtom = atomFamily(
  (chainId: TonChainId) =>
    atomWithStorage<InitialPoolData[]>(`pcs:cachedUserPools::${chainId}`, [], undefined, { unstable_getOnInit: true }),
  isEqual,
)
export const cachedUserPoolsAtom = atom(
  (get) => get(cachedUserPoolsListAtom(get(chainIdAtom))),
  (get, set, pools: InitialPoolData[]) => {
    set(cachedUserPoolsListAtom(get(chainIdAtom)), pools)
  },
)
