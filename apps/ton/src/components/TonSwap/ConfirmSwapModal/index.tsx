import { useTranslation } from '@pancakeswap/localization'
import { Currency as EVMCurrency, TradeType } from '@pancakeswap/swap-sdk-core'
import { Currency, Trade } from '@pancakeswap/ton-v2-sdk'
import { ArrowDownIcon, Button, Flex, FlexGap, Heading } from '@pancakeswap/uikit'
import { LightGreyCard } from 'components/Card'
import { CurrencyLogo } from 'components/widgets'

import { AdvancedSwapDetailsDropdown } from '../SwapDetails/AdvancedSwapDetailsDropdown'
import { PricingAndSlippage } from '../SwapDetails/PricingAndSlippage'
import { LOGO_SIZE } from '../CurrencyInputPanelSimplify/state'

export interface ConfirmSwapModalProps {
  onConfirm?: () => void
  inputCurrency: Currency
  outputCurrency: Currency
  trade?: Trade<Currency, Currency, TradeType> | null
  refreshTrade: () => void
}
export const ConfirmSwapModal = ({
  onConfirm,
  inputCurrency,
  outputCurrency,
  trade,
  refreshTrade,
}: ConfirmSwapModalProps) => {
  const { t } = useTranslation()
  return (
    <>
      <FlexGap flexDirection="column" gap="16px">
        <Flex justifyContent="space-between">
          <Heading scale="md">{trade?.inputAmount.toExact() ?? '-'}</Heading>
          <FlexGap gap="8px" alignItems="center">
            <Heading scale="md">{inputCurrency.symbol}</Heading>
            <CurrencyLogo currency={inputCurrency as unknown as EVMCurrency} size={`${LOGO_SIZE.MAX}px`} />
          </FlexGap>
        </Flex>
        <ArrowDownIcon color="textSubtle" width="24px" />
        <Flex justifyContent="space-between">
          <Heading scale="md">{trade?.outputAmount.toExact() ?? '-'}</Heading>
          <FlexGap gap="8px" alignItems="center">
            <Heading scale="md">{outputCurrency.symbol}</Heading>
            <CurrencyLogo currency={outputCurrency as unknown as EVMCurrency} size={`${LOGO_SIZE.MAX}px`} />
          </FlexGap>
        </Flex>
      </FlexGap>

      <LightGreyCard mt="24px" padding="16px">
        <PricingAndSlippage
          isLoading={false}
          price={trade?.executionPrice}
          showSlippage={false}
          showFee={false}
          onRefresh={refreshTrade}
        />
        <AdvancedSwapDetailsDropdown trade={trade} />
      </LightGreyCard>

      <Button mt="24px" onClick={onConfirm}>
        {t('Continue')}
      </Button>
    </>
  )
}
