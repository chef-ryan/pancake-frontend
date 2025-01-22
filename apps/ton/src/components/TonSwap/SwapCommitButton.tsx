import { useTranslation } from '@pancakeswap/localization'
import { Button, ButtonProps } from '@pancakeswap/uikit'
import { toNano } from '@ton/ton'
import { inputCurrencyAtom, typedValueAtom } from 'atoms/swap/swapStateAtom'
import { useAtomValue } from 'jotai'
import { balanceAtom } from 'ton/logic/balanceAtom'

interface SwapCommitButtonProps extends ButtonProps {}

export const SwapCommitButton = (props: SwapCommitButtonProps) => {
  const { t } = useTranslation()

  const inputCurrency = useAtomValue(inputCurrencyAtom)
  const typedValue = useAtomValue(typedValueAtom)
  const { data: balance0 } = useAtomValue(balanceAtom(inputCurrency))

  const isInsufficientBalance0 = balance0 < toNano(typedValue) // TODO: decimals

  return (
    <Button disabled={isInsufficientBalance0} {...props}>
      {t('Swap')}
    </Button>
  )
}
