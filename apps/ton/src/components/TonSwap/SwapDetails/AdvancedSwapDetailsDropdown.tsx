import { memo } from 'react'
import { styled } from 'styled-components'
import { usePreviousValue } from '@pancakeswap/hooks'
import { AdvancedSwapDetails } from './AdvancedSwapDetails'
import { AdvancedSwapDetailsProps } from './SwapRoute'

const AdvancedDetailsFooter = styled.div`
  margin-top: 8px;
  width: 100%;
  border-radius: 20px;
`

export const AdvancedSwapDetailsDropdown = memo(({ trade, ...rest }: AdvancedSwapDetailsProps) => {
  const lastTrade = usePreviousValue(trade)

  return (
    <AdvancedDetailsFooter>
      <AdvancedSwapDetails {...rest} trade={trade ?? lastTrade ?? undefined} />
    </AdvancedDetailsFooter>
  )
})
