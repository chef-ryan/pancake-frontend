import { BoxProps } from '@pancakeswap/uikit'
import { useUserPools } from 'hooks/liquidity/useUserPools'
import { ScrollableList } from 'styles'
import { LiquidityRow } from './LiquidityRow'

interface LiquidityListProps extends BoxProps {}
export const LiquidityList = (props: LiquidityListProps) => {
  const { data: userPools } = useUserPools()

  return (
    <>
      <ScrollableList padding="16px" maxHeight="300px" {...props}>
        {userPools.map((item) => (
          <LiquidityRow key={item.poolAddress} {...item} />
        ))}
      </ScrollableList>
    </>
  )
}
