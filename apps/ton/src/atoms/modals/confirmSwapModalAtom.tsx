import { memo } from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { Text } from '@pancakeswap/uikit'
import { ConfirmSwapModal, ConfirmSwapModalProps } from 'components/TonSwap/ConfirmSwapModal'
import { atom } from 'jotai'
import { appModalAtom } from './appModalAtom'

const Title = memo(() => {
  const { t } = useTranslation()
  return (
    <Text fontSize="20px" width="100%" textAlign="center" bold>
      {t('Confirm Swap')}
    </Text>
  )
})

type ConfirmSwapModalAtomProps = { isOpen: boolean } & ConfirmSwapModalProps

export const setConfirmSwapModalAtom = atom(
  null,
  (_, set, { isOpen = true, onClose, ...props }: ConfirmSwapModalAtomProps) => {
    set(appModalAtom, {
      title: null,
      content: <ConfirmSwapModal {...props} />,
      closeable: true,
      onClose,
      isOpen,
      bodyPadding: '16px 16px 32px',
    })
  },
)
