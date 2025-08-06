import { atom, useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

// default priority fee lamports
const DEFAULT_PRIORITY_FEE = 0

const solanaPriorityFeeAtom = atomWithStorage('solanaPriorityFee', DEFAULT_PRIORITY_FEE)

export const solanaPriorityFeeAtomWithLocalStorage = atom(
  (get) => get(solanaPriorityFeeAtom),
  (_get, set, fee: number) => {
    if (typeof fee === 'number') {
      set(solanaPriorityFeeAtom, fee)
    }
  },
)

export const useSolanaPriorityFee = () => {
  return useAtom(solanaPriorityFeeAtomWithLocalStorage)
}
