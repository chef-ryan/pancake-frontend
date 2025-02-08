import { Box } from '@pancakeswap/uikit'
import { styled } from 'styled-components'

const Card = styled(Box)<{ width?: string; padding?: string; border?: string; borderRadius?: string }>`
  width: ${({ width }) => width ?? '100%'};
  border-radius: 16px;
  padding: 1rem;
  padding: ${({ padding }) => padding};
  border: ${({ border }) => border};
  border-radius: ${({ borderRadius }) => borderRadius};
`
export default Card

export const LightCard = styled(Card)`
  border: 1px solid ${({ theme }) => theme.colors.background};
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
`

export const LightGreyCard = styled(Card)`
  background-color: ${({ theme }) => theme.colors.backgroundDisabled};
`

export const GreyCard = styled(Card)`
  background-color: ${({ theme }) => theme.colors.backgroundAlt2};
`

export const DarkGreyCard = styled(Card)`
  background-color: ${({ theme }) => theme.colors.background};
`

export const GreyBadge = styled(Card)`
  width: fit-content;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.backgroundDisabled};
  color: ${({ theme }) => theme.colors.text};
  padding: 4px 6px;
  font-weight: 400;
`
