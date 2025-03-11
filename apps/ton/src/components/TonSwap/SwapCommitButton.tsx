import { useTranslation } from '@pancakeswap/localization'
import { TradeType } from '@pancakeswap/swap-sdk-core'
import { Currency, Trade } from '@pancakeswap/ton-v2-sdk'
import { Button, ButtonProps } from '@pancakeswap/uikit'
import { typedValueAtom, useInputCurrencyQueryState } from 'atoms/swap/swapStateAtom'
import { ConnectWalletButton } from 'components/Buttons/ConnectWalletButton'
import { useAtomValue } from 'jotai'
import { memo, useMemo } from 'react'
import { isConnectedAtom } from 'ton/atom/isConnectedAtom'
import { balanceAtom } from 'ton/logic/balanceAtom'
import { computeTradePriceBreakdown, warningSeverity } from 'utils/exchange'
import { tryParseAmount } from 'utils/tryParseAmount'

interface SwapCommitButtonProps extends ButtonProps {
  isLoading?: boolean
  isSwaping?: boolean
  trade?: Trade<Currency, Currency, TradeType> | null
}

export const SwapCommitButton = memo(
  ({ isLoading = false, isSwaping = false, trade, ...props }: SwapCommitButtonProps) => {
    const { t } = useTranslation()
    const isConnected = useAtomValue(isConnectedAtom)

    const [inputCurrency] = useInputCurrencyQueryState()
    const typedValue = useAtomValue(typedValueAtom)
    const typedAmount = tryParseAmount(typedValue, inputCurrency)
    const { data: balance0 } = useAtomValue(balanceAtom(inputCurrency))

    const isInsufficientBalance0 = inputCurrency && typedAmount ? typedAmount.greaterThan(balance0) : false
    const isInsufficientLiquidity = !trade?.route.path.length && !isLoading

    const priceImpactSeverity = useMemo(() => {
      const { priceImpactWithoutFee } = computeTradePriceBreakdown(trade)
      return warningSeverity(priceImpactWithoutFee)
    }, [trade])

    const disabled = useMemo(
      () => isInsufficientBalance0 || isLoading || isSwaping || isInsufficientLiquidity || priceImpactSeverity > 3,
      [isInsufficientBalance0, isLoading, isSwaping, isInsufficientLiquidity, priceImpactSeverity],
    )

    const buttonText = useMemo(
      () =>
        !typedValue.length
          ? t('Enter an amount')
          : isLoading
          ? t('Updating the quote')
          : isInsufficientBalance0
          ? t('Insufficient %symbol% balance', { symbol: inputCurrency?.symbol })
          : isInsufficientLiquidity
          ? t('Insufficient liquidity for this trade.')
          : priceImpactSeverity > 3
          ? t('Price Impact Too High')
          : priceImpactSeverity > 2
          ? t('Swap Anyway')
          : isSwaping
          ? t('Waiting For Confirmation')
          : t('Swap'),
      [
        isSwaping,
        inputCurrency?.symbol,
        isInsufficientLiquidity,
        isInsufficientBalance0,
        isLoading,
        priceImpactSeverity,
        t,
        typedValue.length,
      ],
    )

    return !isConnected ? (
      <ConnectWalletButton width="100%" />
    ) : (
      <Button disabled={disabled} variant={priceImpactSeverity > 2 ? 'danger' : 'primary'} {...props}>
        {buttonText}
      </Button>
    )
  },
)
