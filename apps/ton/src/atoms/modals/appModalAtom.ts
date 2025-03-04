import { type ModalProps } from '@pancakeswap/uikit'
import { atom } from 'jotai'
import { ReactNode } from 'react'

export interface AppModalData extends ModalProps {
  isOpen: boolean
  /** Pass translated values */
  title: ReactNode | null
  content: ReactNode | null
  closeable?: boolean
  onClose?: () => void
}

export const defaultAppModalData: AppModalData = {
  isOpen: false,
  title: null,
  content: null,
  closeable: true,
}

export const appModalAtom = atom<AppModalData>(defaultAppModalData)
export const resetAppModalAtom = atom(null, (_, set) => {
  set(appModalAtom, defaultAppModalData)
})
