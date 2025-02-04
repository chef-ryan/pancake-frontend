import { Button } from '@pancakeswap/uikit'
import styled from 'styled-components'

export const CurrencySelectButton = styled(Button).attrs({ variant: 'text', scale: 'sm' })`
  padding: 24px 4px;

  &:hover {
    background: ${({ theme }) => theme.colors.invertedContrast};
  }
`

export const VerticalDivider = styled.span.withConfig({
  shouldForwardProp: (prop) => !['bg', 'height', 'width'].includes(prop),
})<{
  bg?: string
  height?: string
  width?: string
}>`
  background: ${({ bg }) => bg || 'rgba(255, 255, 255, 0.2)'};
  width: ${({ width }) => width || '1px'};
  height: ${({ height }) => height || '20px'};
  margin: 0 4px;
`

export const PrimaryOutlineButton = styled(Button)<{ $height?: string }>`
  border-radius: ${({ theme }) => theme.radii['12px']};
  height: ${({ $height }) => $height ?? '40px'};

  color: ${({ theme, variant }) => (variant === 'text' ? theme.colors.primary60 : 'text')};
  border: ${({ theme, variant }) => (variant === 'text' ? `2px solid ${theme.colors.primary}` : '')};
`
