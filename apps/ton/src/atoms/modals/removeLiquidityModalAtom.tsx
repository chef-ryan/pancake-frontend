import { RemoveLiquidityModal, RemoveLiquidityModalProps } from 'components/Modals/RemoveLiquidityModal'
import { atom } from 'jotai'
import { appModalAtom } from './appModalAtom'

export const setRemoveLiquidityModalAtom = atom(
  null,
  (_, set, { isOpen = true, ...props }: RemoveLiquidityModalProps & { isOpen?: boolean }) => {
    set(appModalAtom, {
      title: null,
      content: <RemoveLiquidityModal {...props} />,
      closeable: true,
      isOpen,
    })
  },
)
