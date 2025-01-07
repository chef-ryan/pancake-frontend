import { Button, Column, Text } from '@pancakeswap/uikit'
import { ButtonAndDetailsPanel } from 'components/TonSwap/ButtonAndDetailsPanel'
import CurrencyInputPanelSimplify from 'components/TonSwap/CurrencyInputPanelSimplify'
import { FlipButton } from 'components/TonSwap/FlipButton'
import { useCallback, useState } from 'react'

import { useTranslation } from '@pancakeswap/localization'
import { setApprovalModalAtom } from 'atoms/modals/approvalModalAtom'
import { setTransactionModalAtom } from 'atoms/modals/transactionModalAtom'
import { typedValueAtom } from 'atoms/swap/swapStateAtom'
import { TransactionActionType } from 'components/Modals/ActionModal'
import { SwapUIV2 } from 'components/widgets/swap-v2'
import { useSwapActionHandlers } from 'hooks/swap/useSwapActionHandlers'
import { useAtomValue, useSetAtom } from 'jotai'
import noop from 'lodash/noop'
import { Field } from 'types'

export const SwapForm = () => {
  const { t } = useTranslation()

  const [inputAmount, setInputAmount] = useState<any>(null)
  const [outputAmount, setOutputAmount] = useState<any>(null)
  const [outputValue, setOutputValue] = useState('')
  const [isUserInsufficientBalance, setIsUserInsufficientBalance] = useState(false)

  const { onUserInput } = useSwapActionHandlers()

  const typedValue = useAtomValue(typedValueAtom)

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

  return (
    <SwapUIV2.SwapFormWrapper>
      <SwapUIV2.SwapTabAndInputPanelWrapper>
        <SwapUIV2.InputPanelWrapper>
          <Column gap="sm">
            <CurrencyInputPanelSimplify
              id="swap-currency-input"
              showUSDPrice
              showMaxButton
              showCommonBases
              inputLoading={false}
              currencyLoading={false}
              label={t('From')}
              value={typedValue}
              maxAmount={undefined}
              showQuickInputButton
              currency={inputAmount?.currency}
              onUserInput={(val) => onUserInput(Field.INPUT, val)}
              onPercentInput={noop}
              onMax={noop}
              onCurrencySelect={() => {
                console.log('On currency select for input')
              }}
              otherCurrency={outputAmount?.currency}
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
              id="swap-currency-input"
              showUSDPrice
              showMaxButton
              showCommonBases
              inputLoading={false}
              currencyLoading={false}
              label={t('From')}
              value={outputValue}
              maxAmount={undefined}
              showQuickInputButton
              currency={outputAmount?.currency}
              onUserInput={noop}
              onPercentInput={noop}
              onMax={noop}
              onCurrencySelect={noop}
              otherCurrency={inputAmount?.currency}
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
