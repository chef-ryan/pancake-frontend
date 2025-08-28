import { Box } from '@pancakeswap/uikit'
import { styled } from 'styled-components'

const IfoLayout = styled(Box)`
  background-color: ${({ theme }) => theme.colors.gradientBubblegum};
`
export const IfoLayoutWrapper = styled(IfoLayout)`
  column-gap: 32px;
  display: grid;
  grid-template-columns: 1fr;
  align-items: flex-start;
  > div {
    margin: 0 auto;
  }
`

export default IfoLayout
