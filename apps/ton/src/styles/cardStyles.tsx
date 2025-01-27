import { Box } from '@pancakeswap/uikit'
import styled from 'styled-components'

export const CardContainer = styled(Box)`
  height: 100%;
  width: 100%;
  min-height: 100vh;

  margin: 24px 0;
  padding: 0 24px;

  max-width: 480px;

  ${({ theme }) => theme.mediaQueries.md} {
    width: fit-content;
    margin: 24px auto;
    min-width: 480px;
  }
`
