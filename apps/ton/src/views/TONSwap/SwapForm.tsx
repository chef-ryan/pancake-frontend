import { Button, Column, Text } from '@pancakeswap/uikit'
import { ButtonAndDetailsPanel } from 'components/TonSwap/ButtonAndDetailsPanel'
import CurrencyInputPanelSimplify from 'components/TonSwap/CurrencyInputPanelSimplify'
import { FlipButton } from 'components/TonSwap/FlipButton'
import { useCallback, useEffect, useState } from 'react'

import { useTranslation } from '@pancakeswap/localization'
import { fetchListAtom } from 'atoms/lists/fetchListAtom'
import { setApprovalModalAtom } from 'atoms/modals/approvalModalAtom'
import { setTransactionModalAtom } from 'atoms/modals/transactionModalAtom'
import { inputCurrencyAtom, outputCurrencyAtom, typedValueAtom } from 'atoms/swap/swapStateAtom'
import { TransactionActionType } from 'components/Modals/ActionModal'
import { SwapUIV2 } from 'components/widgets/swap-v2'
import { useSwapActionHandlers } from 'hooks/swap/useSwapActionHandlers'
import { useAtomValue, useSetAtom } from 'jotai'
import noop from 'lodash/noop'
import { Field } from 'types'

export const SwapForm = () => {
  const { t } = useTranslation()

  const [isListLoaded, setIsListLoaded] = useState(false)

  const [outputValue, setOutputValue] = useState('')
  const [isUserInsufficientBalance, setIsUserInsufficientBalance] = useState(false)

  const { onUserInput, onCurrencySelection } = useSwapActionHandlers()

  const inputCurrency = useAtomValue(inputCurrencyAtom)
  const outputCurrency = useAtomValue(outputCurrencyAtom)

  const typedValue = useAtomValue(typedValueAtom)

  const { data: activeList, isFetched } = useAtomValue(fetchListAtom)

  const setApprovalModal = useSetAtom(setApprovalModalAtom)
  const setTransactionModal = useSetAtom(setTransactionModalAtom)

  const handleSwap = useCallback(() => {
    // simulate modal states
    setApprovalModal('TON', '1000')
    setTimeout(() => {
      setTransactionModal(TransactionActionType.TransactionSubmitted, true)
    }, 1000)
    setTimeout(() => {
      setTransactionModal(TransactionActionType.TransactionComplete, true)
    }, 3000)
  }, [setApprovalModal, setTransactionModal])

  // TODO: Move to separate hook
  useEffect(() => {
    if (!isListLoaded && !inputCurrency && !outputCurrency && isFetched && activeList && activeList.tokens.length > 1) {
      onCurrencySelection(
        Field.INPUT,
        activeList?.tokens.find((token) => token.symbol === 'CAKE'),
      )
      onCurrencySelection(
        Field.OUTPUT,
        activeList?.tokens.find((token) => token.symbol === 'USDT'),
      )

      setIsListLoaded(false)
    }
  }, [activeList, inputCurrency, outputCurrency, isFetched, isListLoaded, onCurrencySelection])

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
              inputLoading={false}
              currencyLoading={false}
              label={t('From')}
              value={typedValue}
              maxAmount={undefined}
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
              isUserInsufficientBalance={isUserInsufficientBalance}
            />
            <FlipButton />
            <CurrencyInputPanelSimplify
              id="swap-currency-output"
              field={Field.OUTPUT}
              showUSDPrice
              showMaxButton
              showCommonBases
              inputLoading={false}
              currencyLoading={false}
              label={t('From')}
              value={outputValue}
              maxAmount={undefined}
              showQuickInputButton
              currency={outputCurrency}
              onUserInput={noop}
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
              isUserInsufficientBalance={isUserInsufficientBalance}
              disabled
            />
          </Column>
        </SwapUIV2.InputPanelWrapper>
      </SwapUIV2.SwapTabAndInputPanelWrapper>
      <ButtonAndDetailsPanel swapCommitButton={<Button onClick={handleSwap}>{t('Swap')}</Button>} />
    </SwapUIV2.SwapFormWrapper>
  )
}
