import { BoxProps, FlexGap } from '@pancakeswap/uikit'
import styled from 'styled-components'
import { LiquidityRow } from './LiquidityRow'

const ScrollableList = styled(FlexGap).attrs({ flexDirection: 'column', gap: '8px' })`
  overflow-y: auto;
  max-height: 300px;
  min-height: 20px;
  padding: 16px;
`

interface LiquidityListProps extends BoxProps {}
export const LiquidityList = (props: LiquidityListProps) => {
  const list = [
    {
      title: 'SYRUP-PAN LP',
      currency0: 'SYRUP',
      currency1: 'PAN',
    },
  ]

  return (
    <>
      <ScrollableList {...props}>
        {list.map((item) => (
          <LiquidityRow key={item.title} {...item} />
        ))}
      </ScrollableList>
    </>
  )
}
