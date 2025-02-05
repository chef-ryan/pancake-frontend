import { Flex, FlexProps } from '@pancakeswap/uikit'
import styled from 'styled-components'

const HorizontalBar = styled.div`
  width: 100px;
  height: 6px;
  background-color: ${({ theme }) => theme.colors.backgroundDisabled};
  border-radius: 10px;
`

interface GrabberBarProps extends FlexProps {}
export const GrabberBar = (props: GrabberBarProps) => {
  return (
    <Flex justifyContent="center" alignItems="center" width="100%" {...props}>
      <HorizontalBar />
    </Flex>
  )
}
