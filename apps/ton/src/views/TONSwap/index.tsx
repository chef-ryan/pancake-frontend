import { Box, Flex } from '@pancakeswap/uikit'
import { Header } from 'components/Header'

import styled from 'styled-components'
import { StyledSwapContainer } from 'styles/swapStyles'
import Page from 'views/Page'
import { SwapForm } from './SwapForm'

const Wrapper = styled(Box)`
  height: 100%;
  width: 100%;
  min-height: 100vh;

  margin: 24px 16px;
  ${({ theme }) => theme.mediaQueries.md} {
    margin: 24px auto;
    width: 100%;
    min-width: 480px;
    max-width: ${({ theme }) => theme.siteWidth}px;
  }
`

export const TonSwapV2 = () => {
  return (
    <Page removePadding>
      <Box width="100%">
        <Header />
      </Box>

      <Flex width="100%" height="100%" justifyContent="center" position="relative">
        <Flex flexDirection="column" alignItems="center" height="100%" width="100%">
          <StyledSwapContainer justifyContent="center" width="100%" style={{ height: '100%' }} $isChartExpanded={false}>
            <Wrapper>
              <SwapForm />
            </Wrapper>
          </StyledSwapContainer>
        </Flex>
      </Flex>
    </Page>
  )
}
