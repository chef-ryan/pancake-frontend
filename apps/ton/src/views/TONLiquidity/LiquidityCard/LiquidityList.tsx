import { BoxProps, FlexGap } from '@pancakeswap/uikit'
import { useUserPools } from 'hooks/liquidity/useUserPools'
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
  const { data: userPools } = useUserPools()

  return (
    <>
      <ScrollableList {...props}>
        {userPools.map((item) => (
          <LiquidityRow key={item.poolAddress} {...item} />
        ))}
      </ScrollableList>
    </>
  )
}
