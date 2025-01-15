import { Button } from '@pancakeswap/uikit'
import styled from 'styled-components'

export const CurrencySelectButton = styled(Button).attrs({ variant: 'text', scale: 'sm' })`
  padding: 24px 4px;

  &:hover {
    background: ${({ theme }) => theme.colors.invertedContrast};
  }
`
