import { styled } from 'styled-components'
import { Flex, Link } from '@pancakeswap/uikit'

export const PageButtons = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.2em;
  margin-bottom: 0.5em;
`

export const Arrow = styled.div<{ faded: boolean }>`
  color: ${({ theme }) => theme.colors.primary};
  opacity: ${(props) => (props.faded ? 0.3 : 1)};
  padding: 0 20px;
  user-select: none;
  &:hover {
    cursor: pointer;
  }
`

export const Break = styled.div`
  height: 1px;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  width: 100%;
`

export const MonoSpace = styled.span`
  font-variant-numeric: tabular-nums;
`

export const ChartCardsContainer = styled(Flex)`
  justify-content: space-between;
  flex-direction: column;
  width: 100%;
  padding: 0;
  gap: 1em;

  & > * {
    width: 100%;
  }

  ${({ theme }) => theme.mediaQueries.md} {
    flex-direction: row;
  }
`

export const StyledCMCLink = styled(Link)`
  width: 24px;
  height: 24px;
  margin-right: 8px;

  & :hover {
    opacity: 0.8;
  }
`

export const ProtocolWrapper = styled.div`
  display: none;
  ${({ theme }) => theme.mediaQueries.md} {
    display: block;
  }
`
