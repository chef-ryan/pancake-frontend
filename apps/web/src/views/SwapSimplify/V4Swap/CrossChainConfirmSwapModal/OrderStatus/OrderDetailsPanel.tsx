import { useTranslation } from '@pancakeswap/localization'
import {
  AutoColumn,
  Box,
  BoxProps,
  Button,
  ChevronDownIcon,
  ChevronUpIcon,
  FlexGap,
  RowBetween,
  RowFixed,
  Text,
} from '@pancakeswap/uikit'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import { LightGreyCard } from 'components/Card'
import { DISPLAY_PRECISION } from 'config/constants/formatting'
import { useAutoSlippageWithFallback } from 'hooks/useAutoSlippageWithFallback'
import { useCurrencyUsdPrice } from 'hooks/useCurrencyUsdPrice'
import { useAtom, useAtomValue } from 'jotai'
import { useCallback, useMemo } from 'react'
import { Field } from 'state/swap/actions'
import styled from 'styled-components'
import { isBridgeOrder, isXOrder } from 'views/Swap/utils'
import {
  computeSlippageAdjustedAmounts as computeSlippageAdjustedAmountsWithSmartRouter,
  computeTradePriceBreakdown as computeTradePriceBreakdownWithSmartRouter,
} from 'views/Swap/V3Swap/utils/exchange'
import { Timeline } from '../components/Timeline'
import { detailsPanelExpanded, detailsPanelProgressExpanded } from '../state/detailsPanel'
import { crossChainOrderDataAtom } from '../state/orderData'
import { CrossChainOrderStatus, CrossChainOrderStepStatus, CrossChainOrderStepType } from '../types'

const ProgressPill = styled(Box)<{ $color: string }>`
  width: 16px;
  height: 4px;
  border-radius: 8px;
  background-color: ${({ theme, $color }) => theme.colors[$color]};
`

interface OrderDetailsPanelProps extends BoxProps {}
export const OrderDetailsPanel = ({ ...props }: OrderDetailsPanelProps) => {
  const { t } = useTranslation()
  const { order, steps, status } = useAtomValue(crossChainOrderDataAtom)
  const [detailsExpanded, setDetailsExpanded] = useAtom(detailsPanelExpanded)
  const [progressExpanded, setProgressExpanded] = useAtom(detailsPanelProgressExpanded)

  // TODO: Remove/Update auto-slippage usage in bridging
  const { slippageTolerance: allowedSlippage } = useAutoSlippageWithFallback()

  const slippageAdjustedAmounts = useMemo(
    () => computeSlippageAdjustedAmountsWithSmartRouter(order, allowedSlippage),
    [order, allowedSlippage],
  )

  const { lpFeeAmount } = useMemo(
    () => computeTradePriceBreakdownWithSmartRouter(isBridgeOrder(order) || isXOrder(order) ? undefined : order?.trade),
    [order],
  )

  // Get lp fee value in USD
  const { data: inputCurrencyPrice } = useCurrencyUsdPrice(order?.trade.inputAmount.currency)
  const lpFeeUSD = useMemo(() => {
    return lpFeeAmount && order?.trade.inputAmount.currency && inputCurrencyPrice
      ? Number(lpFeeAmount.toFixed(18)) * Number(inputCurrencyPrice)
      : undefined
  }, [lpFeeAmount, order?.trade.inputAmount.currency, inputCurrencyPrice])

  const toggleDetailsExpanded = useCallback(() => {
    setDetailsExpanded(!detailsExpanded)
  }, [detailsExpanded, setDetailsExpanded])

  const toggleProgressExpanded = useCallback(() => {
    setProgressExpanded(!progressExpanded)
  }, [progressExpanded, setProgressExpanded])

  return (
    <Box {...props}>
      {!detailsExpanded ? (
        <AutoColumn justify="center">
          <Button variant="text" onClick={toggleDetailsExpanded}>
            <Text color="primary60" bold>
              {t('Details')}
            </Text>
            <ChevronDownIcon ml="2px" color="primary60" />
          </Button>
        </AutoColumn>
      ) : (
        <LightGreyCard padding="16px 16px 0 16px">
          <AutoColumn gap="16px">
            <RowBetween width="100%">
              <Text color="textSubtle" small>
                {t('Progress')}
              </Text>
              <Button variant="text" scale="xs" px="0" onClick={toggleProgressExpanded}>
                <FlexGap gap="4px" alignItems="center">
                  {steps?.map((step) => {
                    return (
                      <ProgressPill
                        $color={
                          step.status === CrossChainOrderStepStatus.SUCCESS
                            ? 'success'
                            : step.status === CrossChainOrderStepStatus.FAILED
                            ? 'failure'
                            : step.status === CrossChainOrderStepStatus.PARTIAL_SUCCESS
                            ? 'warning'
                            : 'inputSecondary'
                        }
                      />
                    )
                  })}
                  {progressExpanded ? <ChevronUpIcon color="primary60" /> : <ChevronDownIcon color="primary60" />}
                </FlexGap>
              </Button>
            </RowBetween>
            {progressExpanded && steps && (
              <RowFixed ml="8px">
                <Timeline
                  items={steps?.map((step) => {
                    const getText = () => {
                      switch (step.type) {
                        case CrossChainOrderStepType.SWAP_AT_SOURCE_CHAIN:
                          return t('Swapped %currencyA% to %currencyB% (%chainName%)', {
                            currencyA: step.inputCurrency?.symbol,
                            currencyB: step.outputCurrency?.symbol,
                            chainName: step.inputChainName,
                          })
                        case CrossChainOrderStepType.BRIDGE:
                          return t('Bridge %currency% (%inputChain% to %outputChain%)', {
                            currency: step.inputCurrency?.symbol,
                            inputChain: step.inputChainName,
                            outputChain: step.outputChainName,
                          })
                        case CrossChainOrderStepType.SWAP_AT_DESTINATION_CHAIN:
                          return t('Swapped %currencyA% to %currencyB% (%chainName%)', {
                            currencyA: step.inputCurrency?.symbol,
                            currencyB: step.outputCurrency?.symbol,
                            chainName: step.outputChainName,
                          })
                        default:
                          return ''
                      }
                    }

                    const getStatus = () => {
                      switch (step.status) {
                        case CrossChainOrderStepStatus.SUCCESS:
                          return 'completed'
                        case CrossChainOrderStepStatus.PARTIAL_SUCCESS:
                          return 'warning'
                        case CrossChainOrderStepStatus.FAILED:
                          return 'failed'
                        case CrossChainOrderStepStatus.IN_PROGRESS:
                          return 'inProgress'
                        default:
                          return 'notStarted'
                      }
                    }

                    const timelineStatus = getStatus()

                    return {
                      id: step.type,
                      title: getText(),
                      status: timelineStatus,
                      isLast: step.type === steps[steps.length - 1].type,
                      ...(step.failureMessage
                        ? timelineStatus === 'failed'
                          ? { errorMessage: step.failureMessage }
                          : { warningMessage: step.failureMessage }
                        : undefined),
                      tx: step.tx,
                    }
                  })}
                />
              </RowFixed>
            )}

            <RowBetween>
              <Text color="textSubtle" small>
                {status === CrossChainOrderStatus.ORDER_PARTIAL_SUCCESS ? t('Partial Fee') : t('Total Fee')}
              </Text>
              <Text color="textSubtle" small>
                ${lpFeeUSD?.toPrecision(2) || '-'}&nbsp;
              </Text>
            </RowBetween>

            <RowBetween>
              <Text color="textSubtle" small>
                {t('Minimum received')}
              </Text>
              <Text color="textSubtle" small>
                {formatAmount(slippageAdjustedAmounts?.[Field.OUTPUT], DISPLAY_PRECISION)}
                &nbsp;
                {order?.trade.outputAmount.currency.symbol}
              </Text>
            </RowBetween>
          </AutoColumn>
          <AutoColumn justify="center">
            <Button variant="text" onClick={toggleDetailsExpanded}>
              <Text color="primary60" bold>
                {t('Hide')}
              </Text>
              <ChevronUpIcon ml="2px" color="primary60" />
            </Button>
          </AutoColumn>
        </LightGreyCard>
      )}
    </Box>
  )
}
