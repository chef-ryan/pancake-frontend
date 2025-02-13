import { useTranslation } from '@pancakeswap/localization'
import { Button, ButtonProps } from '@pancakeswap/uikit'
import { inputCurrencyAtom, typedValueAtom } from 'atoms/swap/swapStateAtom'
import { useAtomValue } from 'jotai'
import { isConnectedAtom } from 'ton/atom/isConnectedAtom'
import { balanceAtom } from 'ton/logic/balanceAtom'
import { tryParseAmount } from 'utils/tryParseAmount'

interface SwapCommitButtonProps extends ButtonProps {
  isLoading?: boolean
}

export const SwapCommitButton = ({ isLoading = false, disabled = false, ...props }: SwapCommitButtonProps) => {
  const { t } = useTranslation()
  const isConnected = useAtomValue(isConnectedAtom)

  const inputCurrency = useAtomValue(inputCurrencyAtom)

  const typedValue = useAtomValue(typedValueAtom)
  const typedAmount = tryParseAmount(typedValue, inputCurrency)

  const { data: balance0 } = useAtomValue(balanceAtom(inputCurrency))

  const isInsufficientBalance0 = inputCurrency && typedAmount ? typedAmount.greaterThan(balance0) : false

  return (
    <Button disabled={isInsufficientBalance0 || !isConnected || isLoading || disabled} {...props}>
      {!isConnected
        ? t('Connect Wallet')
        : !typedValue
        ? t('Enter an amount')
        : isLoading
        ? t('Updating the quote')
        : isInsufficientBalance0
        ? t('Insufficient %symbol% balance', { symbol: inputCurrency?.symbol })
        : t('Swap')}
    </Button>
  )
}
