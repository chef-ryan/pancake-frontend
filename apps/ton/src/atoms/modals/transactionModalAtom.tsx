import { useTranslation } from '@pancakeswap/localization'
import { Text } from '@pancakeswap/uikit'
import { ActionModal, TransactionActionType } from 'components/Modals/ActionModal'
import { atom } from 'jotai'
import { appModalAtom } from './appModalAtom'

interface TitleProps {
  type: TransactionActionType
}
const Title = ({ type }: TitleProps) => {
  const { t } = useTranslation()
  return (
    <Text fontSize="20px" width="100%" textAlign="center" bold>
      {t('Transaction %postfix%', {
        postfix: type === TransactionActionType.TransactionSubmitted ? 'Submitted' : 'Complete',
      })}
    </Text>
  )
}

export const setTransactionModalAtom = atom(null, (_, set, type: TransactionActionType, isOpen: boolean = true) => {
  set(appModalAtom, {
    title: <Title type={type} />,
    content: <ActionModal currency0="TON" currency1="USDT" amount0="100" amount1="1000" hash="0x00" type={type} />,
    closeable: true,
    isOpen,
  })
})
