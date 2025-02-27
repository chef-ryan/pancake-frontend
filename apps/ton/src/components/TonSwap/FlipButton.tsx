import { AutoColumn } from '@pancakeswap/uikit'
import { memo, useCallback } from 'react'
import { AutoRow } from 'components/Layout/Row'
import { styled } from 'styled-components'
import { SwapUIV2 } from 'components/widgets/swap-v2'
import { useSwapActionHandlers } from 'hooks/swap/useSwapActionHandlers'
import { Field } from 'types'

export const Line = styled.div`
  position: absolute;
  left: -16px;
  right: -16px;
  height: 1px;
  background-color: ${({ theme }) => theme.colors.cardBorder};
  top: calc(50% + 6px);
`

export const FlipButton = memo(function FlipButton({ typedValue = '' }: { typedValue?: string }) {
  const { onSwitchTokens, onUserInput } = useSwapActionHandlers()

  const onFlip = useCallback(() => {
    onSwitchTokens()
    onUserInput(Field.INPUT, typedValue)
  }, [onUserInput, typedValue, onSwitchTokens])

  return (
    <AutoColumn justify="space-between" position="relative">
      <Line />
      <AutoRow justify="center" style={{ padding: '0 1rem', marginTop: '1em' }}>
        <SwapUIV2.SwitchButtonV2 onClick={onFlip} />
      </AutoRow>
    </AutoColumn>
  )
})
