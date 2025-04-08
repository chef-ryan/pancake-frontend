import { atom } from 'jotai'
import { useSingleTokenSwapInfo } from 'state/swap/hooks'

type SwapInfo = ReturnType<typeof useSingleTokenSwapInfo>
export const singleTokenSwapInfoAtom = atom<SwapInfo>({})
