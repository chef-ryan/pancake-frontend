import { useTranslation } from '@pancakeswap/localization'
import { Text } from '@pancakeswap/uikit'
import { ApproveModal } from 'components/Modals/ApproveModal'
import { atom } from 'jotai'
import { appModalAtom } from './appModalAtom'

interface TitleProps {
  currency: string
}
const Title = ({ currency }: TitleProps) => {
  const { t } = useTranslation()
  return (
    <Text fontSize="20px" width="100%" textAlign="center" bold>
      {t('Approve %token%', { token: currency || 'Token' })}
    </Text>
  )
}

export const setApprovalModalAtom = atom(null, (_, set, currency: string, amount: string, isOpen: boolean = true) => {
  set(appModalAtom, {
    title: <Title currency={currency} />,
    content: <ApproveModal key={currency + amount} currency={currency} amount={amount} />,
    closeable: false,
    isOpen,
  })
})
