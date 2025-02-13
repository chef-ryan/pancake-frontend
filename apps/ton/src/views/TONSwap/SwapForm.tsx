import { useTranslation } from '@pancakeswap/localization'
import { Rounding } from '@pancakeswap/swap-sdk-core'
import { Native, TonNetworks } from '@pancakeswap/ton-v2-sdk'
import { Column, Text } from '@pancakeswap/uikit'
import { formatFraction } from '@pancakeswap/utils/formatFractions'
import { useUserSlippage } from '@pancakeswap/utils/user'
import { toNano } from '@ton/core'
import { setApprovalModalAtom } from 'atoms/modals/approvalModalAtom'
import { setTransactionModalAtom } from 'atoms/modals/transactionModalAtom'
import { independentFieldAtom, inputCurrencyAtom, outputCurrencyAtom, typedValueAtom } from 'atoms/swap/swapStateAtom'
import { TransactionActionType } from 'components/Modals/ActionModal'
import { ButtonAndDetailsPanel } from 'components/TonSwap/ButtonAndDetailsPanel'
import CurrencyInputPanelSimplify from 'components/TonSwap/CurrencyInputPanelSimplify'
import { FlipButton } from 'components/TonSwap/FlipButton'
import { SwapCommitButton } from 'components/TonSwap/SwapCommitButton'
import { SwapUIV2 } from 'components/widgets/swap-v2'
import { PRESET_TOKENS } from 'config/constants/tokens'
import { useSwapActionHandlers } from 'hooks/swap/useSwapActionHandlers'
import { useTradeExactIn } from 'hooks/swap/useTradeExactIn'
import { useTradeExactOut } from 'hooks/swap/useTradeExactOut'
import { useAtomValue, useSetAtom } from 'jotai'
import noop from 'lodash/noop'
import { useCallback, useEffect, useMemo } from 'react'
import { chainIdAtom } from 'ton/atom/chainIdAtom'
import { balanceAtom } from 'ton/logic/balanceAtom'
import { useSwap } from 'ton/logic/swap/useSwap'
import { Field } from 'types'
import { tryParseAmount } from 'utils/tryParseAmount'

export const SwapForm = () => {
  const { t } = useTranslation()
  const chainId = useAtomValue(chainIdAtom)

  const inputCurrency = useAtomValue(inputCurrencyAtom)
  const outputCurrency = useAtomValue(outputCurrencyAtom)
  const typedValue = useAtomValue(typedValueAtom)
  const independentField = useAtomValue(independentFieldAtom)

  const isExactIn: boolean = independentField === Field.INPUT
  const parsedAmount = tryParseAmount(typedValue, (isExactIn ? inputCurrency : outputCurrency) ?? undefined)
  const { isLoading: isTradeExactInLoading, data: bestTradeExactIn } = useTradeExactIn(
    isExactIn ? parsedAmount : undefined,
    outputCurrency ?? undefined,
  )
  const { isLoading: isTradeExactOutLoading, data: bestTradeExactOut } = useTradeExactOut(
    isExactIn ? undefined : parsedAmount,
    inputCurrency ?? undefined,
  )
  const trade = isExactIn ? bestTradeExactIn : bestTradeExactOut

  const { onUserInput, onCurrencySelection } = useSwapActionHandlers()

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
    () => balance0 < toNano(parsedAmounts[Field.INPUT]?.toFixed() ?? '0'),
    [balance0, parsedAmounts],
  ) // TODO: decimals
  const { swap } = useSwap()

  const handleSwap = useCallback(async () => {
    if (!inputCurrency || !outputCurrency) {
      return
    }
    await swap({
      // todo:@eric
      minOut: '0.01',
      amount0: formattedAmounts[Field.INPUT] ?? '0',
      token0: inputCurrency,
      token1: outputCurrency,
    })
    // simulate modal states
    // setApprovalModal('TON', '1000')
    setTransactionModal(TransactionActionType.TransactionSubmitted, true)
    /* setTimeout(() => {
      setTransactionModal(TransactionActionType.TransactionComplete, true)
    }, 3000) */
  }, [swap, inputCurrency, outputCurrency, formattedAmounts, setTransactionModal])

  // Set default currencies on load
  useEffect(() => {
    if (!inputCurrency && !outputCurrency) {
      onCurrencySelection(Field.INPUT, Native.onNetwork(TonNetworks.Testnet))
      onCurrencySelection(Field.OUTPUT, PRESET_TOKENS.CAKE[chainId])
    }
  }, [inputCurrency, outputCurrency, chainId, onCurrencySelection])

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
      <ButtonAndDetailsPanel swapCommitButton={<SwapCommitButton onClick={handleSwap} />} />
    </SwapUIV2.SwapFormWrapper>
  )
}
