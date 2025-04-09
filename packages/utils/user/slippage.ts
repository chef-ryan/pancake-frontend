import { Percent } from '@pancakeswap/swap-sdk-core'
import { atom, useAtom } from 'jotai'
import { atomWithStorage, RESET } from 'jotai/utils'

export const INITIAL_ALLOWED_SLIPPAGE = 50

const userSlippageAtom = atomWithStorage('pcs:slippage', INITIAL_ALLOWED_SLIPPAGE)

const userSlippageAtomWithLocalStorage = atom(
  (get) => get(userSlippageAtom),
  (_get, set, slippage: number | typeof RESET) => {
    if (typeof slippage === 'number') {
      set(userSlippageAtom, slippage)
    } else if (slippage === RESET) {
      set(userSlippageAtom, RESET)
    }
  },
)

export const useUserSlippage = () => {
  return useAtom(userSlippageAtomWithLocalStorage)
}

// Derived atom for slippage as a Percent
const userSlippagePercentAtom = atom((get) => {
  const slippage = get(userSlippageAtom)
  return new Percent(slippage, 10_000)
})

export const useUserSlippagePercent = () => {
  return useAtom(userSlippagePercentAtom)
}
