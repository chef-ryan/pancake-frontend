import { Currency } from '@pancakeswap/ton-v2-sdk'
import { setCurrencyAtom } from 'atoms/currencyAtoms'
import { independentFieldAtom, inputCurrencyAtom, outputCurrencyAtom, typedValueAtom } from 'atoms/swap/swapStateAtom'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { Field } from 'types'

export const useSwapActionHandlers = () => {
  const setTypedValue = useSetAtom(typedValueAtom)
  const [independentField, setIndependentField] = useAtom(independentFieldAtom)
  const setCurrency = useSetAtom(setCurrencyAtom)

  const inputCurrency = useAtomValue(inputCurrencyAtom)
  const outputCurrency = useAtomValue(outputCurrencyAtom)

  const onSwitchTokens = useCallback(() => {
    setCurrency(Field.INPUT, outputCurrency)
    setCurrency(Field.OUTPUT, inputCurrency)
    setIndependentField(independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT)
  }, [setCurrency, inputCurrency, outputCurrency, independentField, setIndependentField])

  const onCurrencySelection = useCallback(
    (field: Field, currency?: Currency) => {
      if (
        (field === Field.INPUT && currency?.equals(outputCurrency)) ||
        (field === Field.OUTPUT && currency?.equals(inputCurrency))
      ) {
        onSwitchTokens()
        return
      }
      setCurrency(field, currency)
    },
    [setCurrency, inputCurrency, outputCurrency, onSwitchTokens],
  )

  const onUserInput = useCallback(
    (field: Field, typedValue: string) => {
      setTypedValue(typedValue)
      setIndependentField(field)
    },
    [setTypedValue, setIndependentField],
  )

  return {
    onUserInput,
    onSwitchTokens,
    onCurrencySelection,
  }
}
