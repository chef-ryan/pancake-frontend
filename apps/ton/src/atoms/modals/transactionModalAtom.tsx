import { useTranslation } from '@pancakeswap/localization'
import { Currency } from '@pancakeswap/ton-v2-sdk'
import { Text } from '@pancakeswap/uikit'
import { ActionModal, ActionType } from 'components/Modals/ActionModal'
import { atom } from 'jotai'
import { appModalAtom } from './appModalAtom'

interface TitleProps {
  type: ActionType
}
const Title = ({ type }: TitleProps) => {
  const { t } = useTranslation()

  const titleByAction = {
    [ActionType.TransactionSubmitted]: t('Transaction Submitted'),
    [ActionType.TransactionComplete]: t('Transaction Complete'),
    [ActionType.ConfirmSupply]: t('Confirm Supply'),
  }

  return (
    <Text fontSize="20px" width="100%" textAlign="center" bold>
      {titleByAction[type]}
    </Text>
  )
}

interface SetTransactionModalArgs {
  type: ActionType
  isOpen?: boolean
  currency0?: Currency
  currency1?: Currency
  amount0?: string
  amount1?: string
  hash?: string
}
export const setTransactionModalAtom = atom(
  null,
  (_, set, { type, isOpen = true, ...props }: SetTransactionModalArgs) => {
    set(appModalAtom, {
      title: <Title type={type} />,
      content: <ActionModal type={type} {...props} />,
      closeable: true,
      isOpen,
    })
  },
)
