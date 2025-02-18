import { useTranslation } from '@pancakeswap/localization'
import { Text } from '@pancakeswap/uikit'
import { WalletModal } from 'components/Modals/WalletModal'
import { atom } from 'jotai'
import { appModalAtom } from './appModalAtom'

const Title = () => {
  const { t } = useTranslation()
  return (
    <Text fontSize="20px" width="100%" textAlign="center" bold>
      {t('Wallet Connected')}
    </Text>
  )
}

interface SetWalletModalAtomArgs {
  isOpen?: boolean
}
export const setWalletModalAtom = atom(null, (_, set, { isOpen = true }: SetWalletModalAtomArgs = {}) => {
  set(appModalAtom, {
    title: <Title />,
    content: <WalletModal />,
    closeable: true,
    isOpen,
  })
})
