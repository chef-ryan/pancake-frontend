import { useAtomValue } from 'jotai'
import noop from 'lodash/noop'
import { useCallback, useMemo } from 'react'

import { useTranslation } from '@pancakeswap/localization'
import { Rounding } from '@pancakeswap/swap-sdk-core'
import { Column, Text } from '@pancakeswap/uikit'
import { formatFraction } from '@pancakeswap/utils/formatFractions'
import {
  independentFieldAtom,
  typedValueAtom,
  useInputCurrencyQueryState,
  useOutputCurrencyQueryState,
} from 'atoms/swap/swapStateAtom'
import { ButtonAndDetailsPanel } from 'components/TonSwap/ButtonAndDetailsPanel'
import CurrencyInputPanelSimplify from 'components/TonSwap/CurrencyInputPanelSimplify'
import { FlipButton } from 'components/TonSwap/FlipButton'
import { SwapCommitButton } from 'components/TonSwap/SwapCommitButton'
import { SwapUIV2 } from 'components/widgets/swap-v2'
import { useBestTrade } from 'hooks/swap/useBestTrade'
import { useSwapActionHandlers } from 'hooks/swap/useSwapActionHandlers'
import { balanceAtom } from 'ton/logic/balanceAtom'
import { useSwap } from 'ton/logic/swap/useSwap'
import { Field } from 'types'
import { tryParseAmount } from 'utils/tryParseAmount'
import { useIsSwapDetailPanelOpen } from 'hooks/swap/useIsSwapDetailPanelOpen'
import { computeTradePriceBreakdown } from 'utils/exchange'
import { PricingAndSlippage } from 'components/TonSwap/SwapDetails/PricingAndSlippage'
import { AdvancedSwapDetailsDropdown } from 'components/TonSwap/SwapDetails/AdvancedSwapDetailsDropdown'
import { useUserSlippagePercent } from 'hooks/useUserSlippage'
import { addressAtom } from 'ton/atom/addressAtom'
import { ConnectWalletButton } from 'components/Buttons/ConnectWalletButton'

export const SwapForm = () => {
  const { t } = useTranslation()
  const address = useAtomValue(addressAtom)
  const isWalletConnected = !!address

  const [inputCurrency] = useInputCurrencyQueryState()
  const [outputCurrency] = useOutputCurrencyQueryState()
  const typedValue = useAtomValue(typedValueAtom)
  const independentField = useAtomValue(independentFieldAtom)

  const isExactIn: boolean = independentField === Field.INPUT
  const parsedAmount = tryParseAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined)
  const { isTradeExactInLoading, isTradeExactOutLoading, trade, refreshTrade } = useBestTrade({
    isExactIn,
    amount: parsedAmount,
    inputCurrency,
    outputCurrency,
  })
  const isTradeLoading = useMemo(
    () => isTradeExactOutLoading || isTradeExactInLoading,
    [isTradeExactOutLoading, isTradeExactInLoading],
  )
  const parsedAmounts = useMemo(
    () => ({
      [Field.INPUT]: independentField === Field.INPUT ? parsedAmount : trade?.inputAmount,
      [Field.OUTPUT]: independentField === Field.OUTPUT ? parsedAmount : trade?.outputAmount,
    }),
    [independentField, parsedAmount, trade],
  )
  const dependentField: Field = independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT
  const dependentFieldAmount = parsedAmounts[dependentField]
  const formattedAmounts = useMemo(
    () => ({
      [independentField]: typedValue,
      [dependentField]: dependentFieldAmount
        ? formatFraction(
            dependentFieldAmount.asFraction.divide(10n ** BigInt(dependentFieldAmount.currency.decimals)),
            6,
            Rounding.ROUND_DOWN,
          )
        : '',
    }),
    [independentField, typedValue, dependentField, dependentFieldAmount],
  )

  const { data: balance0 } = useAtomValue(balanceAtom(inputCurrency))
  const [allowedSlippage] = useUserSlippagePercent()
  const [isSwapDetailPanelOpen] = useIsSwapDetailPanelOpen()
  const { realizedLPFee } = computeTradePriceBreakdown(trade)
  const { onUserInput, onCurrencySelection } = useSwapActionHandlers()

  const [isInsufficientBalance0, isInsufficientLiquidity] = useMemo(
    () => [
      parsedAmounts[Field.INPUT] ? parsedAmounts[Field.INPUT].greaterThan(balance0) : false,
      !trade?.route.path.length && !isTradeLoading,
    ],
    [balance0, parsedAmounts, isTradeLoading, trade?.route.path.length],
  )

  const { confirmSwap } = useSwap({
    trade,
    refreshTrade,
    minOut: isExactIn
      ? trade?.minimumAmountOut(allowedSlippage).toExact()
      : trade?.maximumAmountIn(allowedSlippage).toExact(),
    amount0: formattedAmounts[Field.INPUT] ?? '0',
    token0: inputCurrency,
    token1: outputCurrency,
  })

  const handleSwap = useCallback(async () => {
    try {
      await confirmSwap()
      onUserInput(Field.INPUT, '')
    } finally {
      refreshTrade()
    }
  }, [onUserInput, confirmSwap, refreshTrade])

  const handlePercentInput = useCallback(() => {}, [])

  const [inputTitle, outputTitle] = useMemo(
    () => [
      <Text color="textSubtle" fontSize={12} bold>
        {t('From')}
      </Text>,
      <Text color="textSubtle" fontSize={12} bold>
        {t('To')}
      </Text>,
    ],
    [t],
  )

  return (
    <SwapUIV2.SwapFormWrapper>
      <SwapUIV2.SwapTabAndInputPanelWrapper>
        <SwapUIV2.InputPanelWrapper>
          <Column gap="sm">
            <CurrencyInputPanelSimplify
              id="swap-currency-input"
              field={Field.INPUT}
              title={inputTitle}
              showUSDPrice
              showMaxButton
              showCommonBases
              inputLoading={isTradeExactOutLoading}
              currencyLoading={false}
              value={formattedAmounts[Field.INPUT]}
              showQuickInputButton
              currency={inputCurrency}
              otherCurrency={outputCurrency}
              commonBasesType={undefined}
              isUserInsufficientBalance={isInsufficientBalance0}
              onUserInput={(val) => onUserInput(Field.INPUT, val)}
              onPercentInput={handlePercentInput}
              onMax={handlePercentInput}
              onCurrencySelect={(currency) => onCurrencySelection(Field.INPUT, currency)}
            />
            <FlipButton typedValue={formattedAmounts[Field.OUTPUT]} />
            <CurrencyInputPanelSimplify
              id="swap-currency-output"
              field={Field.OUTPUT}
              title={outputTitle}
              disabled
              disabledToolTips={t('Editing output amount is currently not available.')}
              showUSDPrice
              showMaxButton
              showCommonBases
              inputLoading={isTradeExactInLoading}
              currencyLoading={false}
              value={formattedAmounts[Field.OUTPUT]}
              showQuickInputButton
              currency={outputCurrency}
              otherCurrency={inputCurrency}
              commonBasesType={undefined}
              onUserInput={noop}
              onPercentInput={noop}
              onMax={noop}
              onCurrencySelect={(currency) => onCurrencySelection(Field.OUTPUT, currency)}
            />
          </Column>
        </SwapUIV2.InputPanelWrapper>
      </SwapUIV2.SwapTabAndInputPanelWrapper>
      {!isWalletConnected ? (
        <ConnectWalletButton width="100%" />
      ) : (
        <ButtonAndDetailsPanel
          shouldRenderDetails={Boolean(typedValue) && !isInsufficientLiquidity}
          swapCommitButton={<SwapCommitButton trade={trade} isLoading={isTradeLoading} onClick={handleSwap} />}
          pricingAndSlippage={
            <PricingAndSlippage
              isLoading={isTradeLoading}
              price={trade?.executionPrice}
              showSlippage={false}
              showFee={Boolean(trade && !isSwapDetailPanelOpen)}
              fee={realizedLPFee}
              onRefresh={refreshTrade}
            />
          }
          tradeDetails={<AdvancedSwapDetailsDropdown isLoading={isTradeLoading} trade={trade} />}
        />
      )}
    </SwapUIV2.SwapFormWrapper>
  )
}
