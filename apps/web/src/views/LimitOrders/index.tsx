import { useTranslation } from '@pancakeswap/localization'
import { AutoColumn, Box, Button, Flex, Link, useMatchBreakpoints } from '@pancakeswap/uikit'
import { AppBody } from 'components/App'
import CurrencyInputPanel from 'components/CurrencyInputPanel'
import { LIMIT_ORDERS_DOCS_URL } from 'config/constants/exchange'
import useTheme from 'hooks/useTheme'
import { CommonBasesType } from 'components/SearchModal/types'
import noop from 'lodash/noop'
import Page from '../Page'
import ClaimWarning from './components/ClaimWarning'
import CurrencyInputHeader from './components/CurrencyInputHeader'
import LimitOrderTable from './components/LimitOrderTable'
import SwitchTokensButton from './components/SwitchTokensButton'
import { StyledInputCurrencyWrapper, StyledSwapContainer, Wrapper } from './styles'

const LimitOrders = () => {
  const { t } = useTranslation()
  const { isDesktop } = useMatchBreakpoints()
  const { theme } = useTheme()

  return (
    <Page removePadding={false} hideFooterOnDesktop={false} noMinHeight helpUrl={LIMIT_ORDERS_DOCS_URL}>
      <ClaimWarning />
      <Flex width="100%" height="100%" justifyContent="center" position="relative" mb="24px">
        {isDesktop && (
          <Flex width="50%" maxWidth="928px" flexDirection="column">
            <Box width="100%">
              <LimitOrderTable />
            </Box>
          </Flex>
        )}
        <Flex flexDirection="column" alignItems="center">
          <StyledSwapContainer $isChartExpanded={false}>
            <StyledInputCurrencyWrapper>
              <AppBody>
                <CurrencyInputHeader title={t('Limit')} subtitle={t('Place a limit order to trade at a set price')} />
                <Wrapper id="limit-order-page" style={{ minHeight: '412px' }}>
                  <AutoColumn gap="sm">
                    <CurrencyInputPanel
                      value=""
                      showQuickInputButton
                      showMaxButton
                      onUserInput={noop}
                      onPercentInput={noop}
                      onMax={noop}
                      onCurrencySelect={noop}
                      id="limit-order-currency-input"
                      showCommonBases
                      commonBasesType={CommonBasesType.SWAP_LIMITORDER}
                      showUSDPrice
                      disabled
                    />

                    <SwitchTokensButton handleSwitchTokens={noop} color="text" />
                    <CurrencyInputPanel
                      value=""
                      onUserInput={noop}
                      showMaxButton={false}
                      id="limit-order-currency-output"
                      showCommonBases
                      commonBasesType={CommonBasesType.SWAP_LIMITORDER}
                      showUSDPrice
                      disabled
                    />
                  </AutoColumn>
                  <Box mt="0.25rem">
                    <Button variant="primary" onClick={noop} id="place-order-button" width="100%" disabled>
                      {t('Placing Order Disabled')}
                    </Button>
                  </Box>
                  <Flex mt="16px" justifyContent="center">
                    <Link external href="https://www.gelato.network/">
                      <img
                        src={
                          theme.isDark ? '/images/powered_by_gelato_white.svg' : '/images/powered_by_gelato_black.svg'
                        }
                        alt="Powered by Gelato"
                        width="170px"
                        height="48px"
                      />
                    </Link>
                  </Flex>
                </Wrapper>
              </AppBody>
            </StyledInputCurrencyWrapper>
          </StyledSwapContainer>
          {!isDesktop && (
            <Flex mt="24px" width="100%">
              <LimitOrderTable />
            </Flex>
          )}
        </Flex>
      </Flex>
    </Page>
  )
}

export default LimitOrders
