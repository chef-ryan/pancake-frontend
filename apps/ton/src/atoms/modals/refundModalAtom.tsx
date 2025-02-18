import { useTranslation } from '@pancakeswap/localization'
import { RefundModal } from 'components/Modals/RefundModal'
import { atom } from 'jotai'
import { appModalAtom } from './appModalAtom'

const Title = () => {
  const { t } = useTranslation()
  return t('Transaction Refund')
}

interface SetRefundModalArgs {
  isOpen?: boolean
}
export const setRefundModalAtom = atom(null, (_, set, { isOpen = true }: SetRefundModalArgs = {}) => {
  set(appModalAtom, {
    title: <Title />,
    content: <RefundModal />,
    closeable: true,
    isOpen,
  })
})
