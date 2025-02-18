import { Button } from '@pancakeswap/uikit'
import styled from 'styled-components'

export const Hr = styled.hr`
  width: 100%;
  border-color: ${({ theme }) => theme.colors.cardBorder};
`

export const TertiaryButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.tertiary};
  color: ${({ theme }) => theme.colors.primary60};
  border: 1px solid ${({ theme }) => theme.colors.tertiary};
  width: 100%;
`
