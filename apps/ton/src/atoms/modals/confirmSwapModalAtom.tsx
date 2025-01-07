import { useTranslation } from '@pancakeswap/localization'
import { Text } from '@pancakeswap/uikit'
import { ConfirmSwapModal } from 'components/TonSwap/ConfirmSwapModal'
import { atom } from 'jotai'
import { appModalAtom, defaultAppModalData } from './appModalAtom'

const Title = () => {
  const { t } = useTranslation()
  return (
    <Text fontSize="20px" width="100%" textAlign="center" bold>
      {t('Confirm Swap')}
    </Text>
  )
}

export const setConfirmSwapModalAtom = atom(null, (_, set, isOpen: boolean = true) => {
  set(appModalAtom, {
    title: <Title />,
    content: <ConfirmSwapModal onDismiss={() => set(appModalAtom, defaultAppModalData)} />,
    closeable: false,
    isOpen,
  })
})
