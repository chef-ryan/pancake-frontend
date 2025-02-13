import { AddLiquidityModal, AddLiquidityModalProps } from 'components/Modals/AddLiquidityModal'
import { atom } from 'jotai'
import { appModalAtom } from './appModalAtom'

export const setAddLiquidityModalAtom = atom(
  null,
  (_, set, { isOpen, ...props }: AddLiquidityModalProps & { isOpen: boolean }) => {
    set(appModalAtom, {
      title: null,
      content: <AddLiquidityModal {...props} />,
      closeable: true,
      isOpen,
    })
  },
)
