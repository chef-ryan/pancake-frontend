import { useTranslation } from '@pancakeswap/localization'
import { Text } from '@pancakeswap/uikit'
import { NetworkSelectModal } from 'components/Modals/NetworkSelectModal'
import { atom } from 'jotai'
import { appModalAtom } from './appModalAtom'

const Title = () => {
  const { t } = useTranslation()
  return (
    <Text fontSize="20px" width="100%" textAlign="center" bold>
      {t('Select Network')}
    </Text>
  )
}

interface SetNetworkModalAtomArgs {
  isOpen?: boolean
}
export const setNetworkModalAtom = atom(null, (_, set, { isOpen = true }: SetNetworkModalAtomArgs = {}) => {
  set(appModalAtom, {
    title: <Title />,
    content: <NetworkSelectModal />,
    closeable: true,
    isOpen,
  })
})
