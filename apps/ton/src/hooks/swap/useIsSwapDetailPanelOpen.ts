import { swapDetailPanelOpenAtom } from 'atoms/swap/swapDetailPanelStateAtom'
import { useAtom } from 'jotai'

export const useIsSwapDetailPanelOpen = () => {
  return useAtom(swapDetailPanelOpenAtom)
}
