import { atom } from 'jotai'
import { ReactElement } from 'react'
import { TransactionErrorContent } from '@pancakeswap/widgets-internal'

import { appModalAtom } from './appModalAtom'

export const setErrorMsgModalAtom = atom(
  null,
  (_, set, { msg, isOpen = true }: { msg: ReactElement | string; isOpen: boolean }) => {
    const handleDismiss = () => {
      set(appModalAtom, {
        title: null,
        content: null,
        isOpen: false,
      })
    }
    set(appModalAtom, {
      title: null,
      content: <TransactionErrorContent message={msg} onDismiss={handleDismiss} />,
      closeable: true,
      isOpen,
    })
  },
)
