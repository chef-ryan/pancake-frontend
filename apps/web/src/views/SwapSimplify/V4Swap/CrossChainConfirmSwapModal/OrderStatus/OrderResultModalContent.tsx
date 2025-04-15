import {
  ArrowForwardIcon,
  Box,
  BoxProps,
  CheckmarkCircleIcon,
  ErrorIcon,
  FlexGap,
  SwapLoading,
  Text,
  WarningIcon,
} from '@pancakeswap/uikit'
import { DualCurrencyDisplay } from '@pancakeswap/widgets-internal'
import { useAtomValue } from 'jotai'

import { useTranslation } from '@pancakeswap/localization'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import { useMemo } from 'react'
import styled from 'styled-components'
import { getFullChainNameById } from 'utils/getFullChainNameById'
import { crossChainOrderDataAtom } from '../state/orderData'
import { CrossChainOrderStatus } from '../types'
import { OrderDetailsPanel } from './OrderDetailsPanel'

const IconContainer = styled(Box)`
  position: relative;
  width: 24px;
  height: 24px;
`

const DisplayMessage = styled(FlexGap).attrs({ alignItems: 'center', gap: '8px' })<{
  $status?: CrossChainOrderStatus | null
}>`
  padding: 12px;
  border-radius: 20px;
  background-color: ${({ theme, $status }) =>
    $status === CrossChainOrderStatus.ORDER_SUCCESS ? theme.colors.primary10 : theme.colors.warning10};
  border: 1px solid
    ${({ theme, $status }) =>
      $status === CrossChainOrderStatus.ORDER_SUCCESS ? theme.colors.primary20 : theme.colors.warning10};
`

interface OrderResultModalContentProps extends BoxProps {}
export const OrderResultModalContent = ({ ...props }: OrderResultModalContentProps) => {
  const { t } = useTranslation()
  const orderData = useAtomValue(crossChainOrderDataAtom)

  const middleIcon = useMemo(() => {
    switch (orderData?.status) {
      case CrossChainOrderStatus.ORDER_SUBMITTED:
        return (
          <IconContainer>
            <ArrowForwardIcon width="24px" ml="4px" color="textSubtle" />
            <SwapLoading style={{ position: 'absolute', top: '2px', left: '7px', scale: '2.5' }} />
          </IconContainer>
        )
      case CrossChainOrderStatus.ORDER_SUCCESS:
        return (
          <IconContainer>
            <CheckmarkCircleIcon width="36px" color="success" />
          </IconContainer>
        )
      case CrossChainOrderStatus.ORDER_PARTIAL_SUCCESS:
        return (
          <FlexGap flexDirection="column" alignItems="center" gap="4px">
            <WarningIcon width="20px" color="binance" />
            <ArrowForwardIcon width="24px" ml="4px" color="textSubtle" />
          </FlexGap>
        )
      default:
        return undefined
    }
  }, [orderData?.status])

  return (
    <Box {...props}>
      {orderData.resultInformation && (
        <DisplayMessage $status={orderData?.status} mb="24px">
          {orderData.status === CrossChainOrderStatus.ORDER_SUCCESS ? (
            <CheckmarkCircleIcon width="24px" color="primary60" />
          ) : (
            <ErrorIcon width="24px" color="warning60" />
          )}
          <Text small>
            {t('%amount% %symbol% has been sent to your wallet on %outputChain%', {
              amount: orderData.resultInformation.amount,
              symbol: orderData.resultInformation.currency.symbol,
              outputChain: orderData.resultInformation.chainName,
            })}
          </Text>
        </DisplayMessage>
      )}
      <DualCurrencyDisplay
        inputCurrency={orderData?.order?.trade.inputAmount.currency}
        outputCurrency={orderData?.order?.trade.outputAmount.currency}
        inputAmount={formatAmount(orderData?.order?.trade.inputAmount)}
        outputAmount={formatAmount(orderData?.order?.trade.outputAmount)}
        inputChainName={getFullChainNameById(orderData?.order?.trade.inputAmount.currency.chainId)}
        outputChainName={getFullChainNameById(orderData?.order?.trade.outputAmount.currency.chainId)}
        overrideIcon={middleIcon}
      />
      <OrderDetailsPanel mt="24px" />
    </Box>
  )
}
