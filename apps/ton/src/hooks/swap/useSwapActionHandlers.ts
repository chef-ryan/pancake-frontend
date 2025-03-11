import { Currency } from '@pancakeswap/ton-v2-sdk'
import {
  independentFieldAtom,
  typedValueAtom,
  useInputCurrencyQueryState,
  useOutputCurrencyQueryState,
} from 'atoms/swap/swapStateAtom'
import { useAtom, useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { Field } from 'types'

export const useSwapActionHandlers = () => {
  const setTypedValue = useSetAtom(typedValueAtom)
  const [, setIndependentField] = useAtom(independentFieldAtom)
  const [inputCurrency, setInputCurrency] = useInputCurrencyQueryState()
  const [outputCurrency, setOutputCurrency] = useOutputCurrencyQueryState()

  const onSwitchTokens = useCallback(() => {
    setInputCurrency(outputCurrency)
    setOutputCurrency(inputCurrency)
    // setIndependentField(independentField === Field.INPUT ? Field.OUTPUT : Field.INPUT)
  }, [setInputCurrency, setOutputCurrency, inputCurrency, outputCurrency])

  const onCurrencySelection = useCallback(
    (field: Field, currency?: Currency) => {
      if (
        (field === Field.INPUT && currency?.equals(outputCurrency)) ||
        (field === Field.OUTPUT && currency?.equals(inputCurrency))
      ) {
        onSwitchTokens()
        return
      }
      if (field === Field.INPUT) {
        setInputCurrency(currency)
      } else {
        setOutputCurrency(currency)
      }
    },
    [setInputCurrency, setOutputCurrency, inputCurrency, outputCurrency, onSwitchTokens],
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
