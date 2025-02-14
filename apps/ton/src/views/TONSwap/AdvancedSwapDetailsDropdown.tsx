import { memo } from 'react'
import { styled } from 'styled-components'
import { usePreviousValue } from '@pancakeswap/hooks'
import { AdvancedSwapDetails, AdvancedSwapDetailsProps } from './AdvancedSwapDetails'

const AdvancedDetailsFooter = styled.div<{ show: boolean }>`
  margin-top: ${({ show }) => (show ? '16px' : 0)};
  width: 100%;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.colors.invertedContrast};
`

export const AdvancedSwapDetailsDropdown = memo(({ trade, ...rest }: AdvancedSwapDetailsProps) => {
  const lastTrade = usePreviousValue(trade)

  return (
    <AdvancedDetailsFooter show={Boolean(trade)}>
      <AdvancedSwapDetails {...rest} trade={trade ?? lastTrade ?? undefined} />
    </AdvancedDetailsFooter>
  )
})
