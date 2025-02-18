import { useTranslation } from '@pancakeswap/localization'
import { TradeType } from '@pancakeswap/swap-sdk-core'
import { Currency, Trade } from '@pancakeswap/ton-v2-sdk'
import { Button, ButtonProps } from '@pancakeswap/uikit'
import { inputCurrencyAtom, typedValueAtom } from 'atoms/swap/swapStateAtom'
import { useAtomValue } from 'jotai'
import { memo } from 'react'
import { isConnectedAtom } from 'ton/atom/isConnectedAtom'
import { balanceAtom } from 'ton/logic/balanceAtom'
import { tryParseAmount } from 'utils/tryParseAmount'

interface SwapCommitButtonProps extends ButtonProps {
  isLoading?: boolean
  trade?: Trade<Currency, Currency, TradeType> | null
}

export const SwapCommitButton = memo(({ isLoading = false, trade, ...props }: SwapCommitButtonProps) => {
  const { t } = useTranslation()
  const isConnected = useAtomValue(isConnectedAtom)

  const inputCurrency = useAtomValue(inputCurrencyAtom)
  const typedValue = useAtomValue(typedValueAtom)
  const typedAmount = tryParseAmount(typedValue, inputCurrency)
  const { data: balance0 } = useAtomValue(balanceAtom(inputCurrency))

  const isInsufficientBalance0 = inputCurrency && typedAmount ? typedAmount.greaterThan(balance0) : false
  const isInsufficientLiquidity = !trade?.route.path.length && !isLoading

  return (
    <Button disabled={isInsufficientBalance0 || !isConnected || isLoading || isInsufficientLiquidity} {...props}>
      {!isConnected
        ? t('Connect Wallet')
        : !typedValue
        ? t('Enter an amount')
        : isLoading
        ? t('Updating the quote')
        : isInsufficientBalance0
        ? t('Insufficient %symbol% balance', { symbol: inputCurrency?.symbol })
        : isInsufficientLiquidity
        ? t('Insufficient liquidity for this trade.')
        : t('Swap')}
    </Button>
  )
})
