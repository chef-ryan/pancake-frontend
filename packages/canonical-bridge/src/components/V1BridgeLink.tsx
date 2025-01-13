import { Flex, Link } from '@pancakeswap/uikit'
import { styled } from 'styled-components'
import { ExternalLinkIcon } from './icons/ExternalLinkIcon'

export function V1BridgeLink({ v1LinkText }: { v1LinkText: string }) {
  return (
    <Flex marginTop="16px" alignItems="center" justifyContent="center">
      <StyledLink href="https://bridge.pancakeswap.finance/" target="_blank" rel="noopener">
        {v1LinkText}
        <ExternalLinkIcon />
      </StyledLink>
    </Flex>
  )
}

const StyledLink = styled(Link)`
  display: inline;
  font-size: 16px;
  line-height: 20px;
  font-weight: 400;
  color: ${(props: any) => (props.theme.isDark ? '#B8ADD2' : '#7A6EAA')};
  text-align: center;
  & > svg {
    margin-left: 4px;
    display: inline;
    vertical-align: middle;
    color: inherit;
    fill: none;
  }
`
