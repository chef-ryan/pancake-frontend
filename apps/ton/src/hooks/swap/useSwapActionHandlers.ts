import { independentFieldAtom, setCurrencyIdAtom, typedValueAtom } from 'atoms/swap/swapStateAtom'
import { useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { Field } from 'types'

export const useSwapActionHandlers = () => {
  const setTypedValue = useSetAtom(typedValueAtom)
  const setIndependentField = useSetAtom(independentFieldAtom)
  const setCurrencyId = useSetAtom(setCurrencyIdAtom)

  const onCurrencySelection = useCallback(
    (field: Field, currency: any) => {
      setCurrencyId(field, currency)
    },
    [setCurrencyId],
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
