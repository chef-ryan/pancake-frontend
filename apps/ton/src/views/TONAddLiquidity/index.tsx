import { Box, Flex } from '@pancakeswap/uikit'
import { Header } from 'components/Header'
import { CardContainer } from 'styles/cardStyles'
import Page from 'views/Page'
import { AddLiquidityCard } from './AddLiquidityCard'

export const TONAddLiquidity = () => {
  return (
    <Page removePadding>
      <Box width="100%">
        <Header showBridgeLink />
      </Box>
      <Flex width="100%" height="100%" justifyContent="center" position="relative">
        <Flex pb="64px" flexDirection="column" alignItems="center" height="100%" width="100%">
          <CardContainer>
            <AddLiquidityCard />
          </CardContainer>
        </Flex>
      </Flex>
    </Page>
  )
}
