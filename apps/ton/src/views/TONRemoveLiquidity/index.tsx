import { Box, Flex } from '@pancakeswap/uikit'
import { Header } from 'components/Header'
import { CardContainer } from 'styles/cardStyles'
import Page from 'views/Page'
import { RemoveLiquidityCard } from './RemoveLiquidityCard'

export const TONRemoveLiquidity = () => {
  return (
    <Page removePadding>
      <Box width="100%">
        <Header />
      </Box>
      <Flex width="100%" height="100%" justifyContent="center" position="relative">
        <Flex flexDirection="column" alignItems="center" height="100%" width="100%">
          <CardContainer>
            <RemoveLiquidityCard />
          </CardContainer>
        </Flex>
      </Flex>
    </Page>
  )
}
