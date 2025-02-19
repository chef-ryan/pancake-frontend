import { useTranslation } from '@pancakeswap/localization'
import { Currency } from '@pancakeswap/ton-v2-sdk'
import { Text } from '@pancakeswap/uikit'
import { ActionModal, ActionType } from 'components/Modals/ActionModal'
import { atom } from 'jotai'
import { memo, useMemo } from 'react'
import { appModalAtom } from './appModalAtom'

interface TitleProps {
  type: ActionType
}
const Title = memo(({ type }: TitleProps) => {
  const { t } = useTranslation()

  const titleByAction: { [type in ActionType]: string } = useMemo(
    () => ({
      [ActionType.ConfirmTransaction]: t('Confirm Transaction'),

      [ActionType.TransactionSubmitted]: t('Transaction Submitted'),
      [ActionType.TransactionComplete]: t('Transaction Complete'),
      [ActionType.ConfirmLiquiditySupply]: t('Confirm Supply'),
      [ActionType.ConfirmLiquidityRemoval]: t('Confirm LP Removal'),

      [ActionType.ConfirmSwap]: t('Confirm Swap'),
      [ActionType.SwapSubmitted]: t('Transaction Submitted'),
      [ActionType.SwapCompleted]: t('Transaction Successful'),
    }),
    [t],
  )

  return (
    <Text fontSize="20px" width="100%" textAlign="center" bold>
      {titleByAction[type]}
    </Text>
  )
})

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
