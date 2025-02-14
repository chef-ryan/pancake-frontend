import { useTranslation } from '@pancakeswap/localization'
import { Rounding } from '@pancakeswap/swap-sdk-core'
import { Native, TonNetworks } from '@pancakeswap/ton-v2-sdk'
import { Column, FlexGap, Text } from '@pancakeswap/uikit'
import { formatFraction } from '@pancakeswap/utils/formatFractions'
import { useUserSlippage } from '@pancakeswap/utils/user'
import { RefreshButton } from '@pancakeswap/widgets-internal'
import { fetchListAtom } from 'atoms/lists/fetchListAtom'
import { setApprovalModalAtom } from 'atoms/modals/approvalModalAtom'
import { setTransactionModalAtom } from 'atoms/modals/transactionModalAtom'
import { independentFieldAtom, inputCurrencyAtom, outputCurrencyAtom, typedValueAtom } from 'atoms/swap/swapStateAtom'
import { ActionType } from 'components/Modals/ActionModal'
import { ButtonAndDetailsPanel } from 'components/TonSwap/ButtonAndDetailsPanel'
import CurrencyInputPanelSimplify from 'components/TonSwap/CurrencyInputPanelSimplify'
import { FlipButton } from 'components/TonSwap/FlipButton'
import { PricingAndSlippage } from 'components/TonSwap/PricingAndSlippage'
import { SwapCommitButton } from 'components/TonSwap/SwapCommitButton'
import { SwapUIV2 } from 'components/widgets/swap-v2'
import { useBestTrade } from 'hooks/swap/useBestTrade'
import { useSwapActionHandlers } from 'hooks/swap/useSwapActionHandlers'
import { useAtomValue, useSetAtom } from 'jotai'
import noop from 'lodash/noop'
import { useCallback, useEffect, useMemo } from 'react'
import { balanceAtom } from 'ton/logic/balanceAtom'
import { useSwap } from 'ton/logic/swap/useSwap'
import { Field } from 'types'
import { tryParseAmount } from 'utils/tryParseAmount'
import { AdvancedSwapDetailsDropdown } from './AdvancedSwapDetailsDropdown'

export const SwapForm = () => {
  const { t } = useTranslation()

  const inputCurrency = useAtomValue(inputCurrencyAtom)
  const outputCurrency = useAtomValue(outputCurrencyAtom)
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

  const { onUserInput, onCurrencySelection } = useSwapActionHandlers()

  const { data: activeList, isFetched } = useAtomValue(fetchListAtom)

  const setApprovalModal = useSetAtom(setApprovalModalAtom)
  const setTransactionModal = useSetAtom(setTransactionModalAtom)
  const [userAllowedSlippage] = useUserSlippage()

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
        : undefined,
    }),
    [independentField, typedValue, dependentField, dependentFieldAmount],
  )

  const { data: balance0 } = useAtomValue(balanceAtom(inputCurrency))
  const isInsufficientBalance0 = useMemo(
    () => (parsedAmounts[Field.INPUT] ? parsedAmounts[Field.INPUT].greaterThan(balance0) : false),
    [balance0, parsedAmounts],
  )
  const { swap } = useSwap()

  const handleSwap = useCallback(async () => {
    if (!inputCurrency || !outputCurrency) {
      return
    }
    await swap({
      minOut: '0.01',
      amount0: formattedAmounts[Field.INPUT] ?? '0',
      token0: inputCurrency,
      token1: outputCurrency,
    })
    // simulate modal states
    // setApprovalModal('TON', '1000')
    setTransactionModal(ActionType.TransactionSubmitted, true)
    /* setTimeout(() => {
      setTransactionModal(ActionType.TransactionComplete, true)
    }, 3000) */
  }, [swap, inputCurrency, outputCurrency, formattedAmounts, setTransactionModal])

  // Set default currencies on load
  useEffect(() => {
    if (isFetched && !inputCurrency && !outputCurrency && activeList && activeList.length > 1) {
      onCurrencySelection(Field.INPUT, Native.onNetwork(TonNetworks.Testnet))
      onCurrencySelection(
        Field.OUTPUT,
        activeList.find((item) => item.symbol === 'CAKE'),
      )
    }
  }, [activeList, inputCurrency, outputCurrency, isFetched, onCurrencySelection])

  return (
    <SwapUIV2.SwapFormWrapper>
      <SwapUIV2.SwapTabAndInputPanelWrapper>
        <SwapUIV2.InputPanelWrapper>
          <Column gap="sm">
            <CurrencyInputPanelSimplify
              id="swap-currency-input"
              field={Field.INPUT}
              showUSDPrice
              showMaxButton
              showCommonBases
              inputLoading={isTradeExactOutLoading}
              currencyLoading={false}
              value={formattedAmounts[Field.INPUT]}
              showQuickInputButton
              currency={inputCurrency}
              onUserInput={(val) => onUserInput(Field.INPUT, val)}
              onPercentInput={noop}
              onMax={noop}
              onCurrencySelect={(currency) => onCurrencySelection(Field.INPUT, currency)}
              otherCurrency={outputCurrency}
              commonBasesType={undefined}
              title={
                <Text color="textSubtle" fontSize={12} bold>
                  {t('From')}
                </Text>
              }
              isUserInsufficientBalance={isInsufficientBalance0}
            />
            <FlipButton />
            <CurrencyInputPanelSimplify
              id="swap-currency-output"
              field={Field.OUTPUT}
              disabled
              showUSDPrice
              showMaxButton
              showCommonBases
              inputLoading={isTradeExactInLoading}
              currencyLoading={false}
              value={formattedAmounts[Field.OUTPUT]}
              showQuickInputButton
              currency={outputCurrency}
              onUserInput={(val) => onUserInput(Field.OUTPUT, val)}
              onPercentInput={noop}
              onMax={noop}
              onCurrencySelect={(currency) => onCurrencySelection(Field.OUTPUT, currency)}
              otherCurrency={inputCurrency}
              commonBasesType={undefined}
              title={
                <Text color="textSubtle" fontSize={12} bold>
                  {t('To')}
                </Text>
              }
            />
          </Column>
        </SwapUIV2.InputPanelWrapper>
      </SwapUIV2.SwapTabAndInputPanelWrapper>
      <ButtonAndDetailsPanel
        shouldRenderDetails={Boolean(typedValue)}
        swapCommitButton={<SwapCommitButton disabled={!trade} isLoading={isTradeLoading} onClick={handleSwap} />}
        pricingAndSlippage={
          <FlexGap
            alignItems="center"
            flexWrap="wrap"
            justifyContent="space-between"
            width="calc(100% - 20px)"
            gap="8px"
            marginLeft="-8px"
          >
            <FlexGap
              onClick={(e) => {
                e.stopPropagation()
              }}
              alignItems="center"
              flexWrap="wrap"
            >
              <RefreshButton
                refreshDuration={12_000}
                onRefresh={refreshTrade}
                refreshDisabled={isTradeLoading}
                loading={isTradeLoading}
              />
              <PricingAndSlippage
                priceLoading={isTradeLoading}
                price={trade?.executionPrice ?? undefined}
                showSlippage={false}
              />
            </FlexGap>
          </FlexGap>
        }
        tradeDetails={<AdvancedSwapDetailsDropdown trade={trade} />}
      />
    </SwapUIV2.SwapFormWrapper>
  )
}
