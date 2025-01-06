import { currencyIdFamily, independentFieldAtom, typedValueAtom } from 'atoms/swap/swapStateAtom'
import { useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { Field } from 'types'

export const useSwapActionHandlers = () => {
  const setInputCurrencyId = useSetAtom(currencyIdFamily(Field.INPUT))
  const setOutputCurrencyId = useSetAtom(currencyIdFamily(Field.OUTPUT))

  const setTypedValue = useSetAtom(typedValueAtom)
  const setIndependentField = useSetAtom(independentFieldAtom)

  const onCurrencySelection = useCallback(
    (field: Field, currency: any) => {
      if (field === Field.INPUT) {
        setInputCurrencyId(currency.id)
      } else {
        setOutputCurrencyId(currency.id)
      }
    },
    [setInputCurrencyId, setOutputCurrencyId],
  )

  const onSwitchTokens = useCallback(() => {}, [])

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
