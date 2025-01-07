import { atom } from 'jotai'
import { ReactNode } from 'react'

export interface AppModalData {
  isOpen: boolean
  /** Pass translated values */
  title: ReactNode | null
  content: ReactNode | null
  closeable?: boolean
}

export const defaultAppModalData: AppModalData = {
  isOpen: false,
  title: null,
  content: null,
  closeable: true,
}

export const appModalAtom = atom<AppModalData>(defaultAppModalData)
