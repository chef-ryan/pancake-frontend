import { useTranslation } from '@pancakeswap/localization'
import { Box, Flex, Link } from '@pancakeswap/uikit'
import { Header } from 'components/Header'
import { Message } from 'components/Message'
import { HelpBunny } from 'components/Misc/HelpBunny'
import { liquidityLearnMoreUrl } from 'config/constants/endpoints'
import { useAtomValue } from 'jotai'
import { CardContainer } from 'styles/cardStyles'
import { isConnectedAtom } from 'ton/atom/isConnectedAtom'
import Page from 'views/Page'
import { LiquidityCard } from './LiquidityCard'

export const TONLiquidity = () => {
  const { t } = useTranslation()
  const isWalletConnected = useAtomValue(isConnectedAtom)

  return (
    <Page removePadding>
      <Box width="100%">
        <Header showBridgeLink />
      </Box>
      <Flex width="100%" height="100%" justifyContent="center" position="relative">
        <Flex flexDirection="column" alignItems="center" height="100%" width="100%">
          <CardContainer>
            <LiquidityCard />

            {isWalletConnected ? (
              <>
                <Message
                  mt="24px"
                  expandedText={
                    <>
                      {t('Fees accrue in real time and are automatically claimed upon liquidity withdrawal. ')}
                      <Link
                        mt="8px"
                        href={liquidityLearnMoreUrl}
                        color="primary60"
                        style={{ textDecoration: 'underline' }}
                        external
                        small
                      >
                        {t('Learn More')}
                      </Link>
                    </>
                  }
                >
                  {t('Liquidity providers earn a 0.X% fee on all trades based on their pool share.')}
                </Message>
              </>
            ) : (
              <Flex justifyContent="center" mt="24px">
                <HelpBunny />
              </Flex>
            )}
          </CardContainer>
        </Flex>
      </Flex>
    </Page>
  )
}
