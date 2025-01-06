import { Button, Column, Text } from '@pancakeswap/uikit'
import { ButtonAndDetailsPanel } from 'components/TonSwap/ButtonAndDetailsPanel'
import CurrencyInputPanelSimplify from 'components/TonSwap/CurrencyInputPanelSimplify'
import { FlipButton } from 'components/TonSwap/FlipButton'
import { useCallback, useState } from 'react'

import { useTranslation } from '@pancakeswap/localization'
import { appModalAtom } from 'atoms/appModalAtom'
import { typedValueAtom } from 'atoms/swap/swapStateAtom'
import { ApproveModal } from 'components/Modals/ApproveModal'
import { ConfirmSwapModal } from 'components/TonSwap/ConfirmSwapModal'
import { SwapUIV2 } from 'components/widgets/swap-v2'
import { useSwapActionHandlers } from 'hooks/swap/useSwapActionHandlers'
import { useAtomValue, useSetAtom } from 'jotai'
import { Field } from 'types'

export const SwapForm = () => {
  const noop = () => {}

  const { t } = useTranslation()

  const [inputAmount, setInputAmount] = useState<any>(null)
  const [outputAmount, setOutputAmount] = useState<any>(null)
  const [outputValue, setOutputValue] = useState('')
  const [isUserInsufficientBalance, setIsUserInsufficientBalance] = useState(false)

  const typedValue = useAtomValue(typedValueAtom)
  const { onUserInput } = useSwapActionHandlers()

  // const [onPresentConfirmModal] = useModal(<ConfirmSwapModal />, true, true, 'confirm-swap-modal')

  const setOpen = useSetAtom(appModalAtom)

  const handleSwapTwo = useCallback(() => {
    setOpen((prev) => ({
      ...prev,
      isOpen: true,
      title: (
        <Text fontSize="20px" width="100%" textAlign="center" bold>
          {t('Approve %token%', { token: 'TON' })}
        </Text>
      ),
      content: <ApproveModal currency="TON" amount="1000" />,
    }))
  }, [t, setOpen])

  const handleSwap = useCallback(() => {
    setOpen((prev) => ({
      ...prev,
      isOpen: true,
      title: t('Confirm Swap'),
      content: <ConfirmSwapModal onDismiss={() => handleSwapTwo()} />,
    }))
  }, [t, setOpen, handleSwapTwo])

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
      <ButtonAndDetailsPanel swapCommitButton={<Button onClick={handleSwap}>Swap</Button>} />
    </SwapUIV2.SwapFormWrapper>
  )
}
