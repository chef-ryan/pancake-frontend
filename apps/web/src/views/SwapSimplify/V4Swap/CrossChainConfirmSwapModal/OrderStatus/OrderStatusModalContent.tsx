import { useTranslation } from '@pancakeswap/localization'
import { BridgeOrder, ClassicOrder } from '@pancakeswap/price-api-sdk'
import { TradeType } from '@pancakeswap/sdk'
import { useAtom, useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { getFullChainNameById } from 'utils/getFullChainNameById'
import { crossChainOrderDataAtom, crossChainOrderStatus } from '../state/orderData'
import { CrossChainOrderStatus, CrossChainOrderStepStatus, CrossChainOrderStepType } from '../types'
import { OrderResultModalContent } from './OrderResultModalContent'

interface OrderStatusModalContentProps {
  order: ClassicOrder<TradeType> | BridgeOrder<TradeType> | null | undefined
  originalOrder: ClassicOrder<TradeType> | BridgeOrder<TradeType> | null | undefined
}

export const OrderStatusModalContent = ({ order, originalOrder }: OrderStatusModalContentProps) => {
  const { t } = useTranslation()
  const orderStatus = useAtomValue(crossChainOrderStatus)
  const [orderData, setOrderData] = useAtom(crossChainOrderDataAtom)

  // TODO: listen to order status changes

  useEffect(() => {
    if (order && order !== orderData?.order) {
      // TODO: Remove test data
      setOrderData({
        status: CrossChainOrderStatus.ORDER_PARTIAL_SUCCESS,
        resultInformation: {
          amount: '100',
          currency: order.trade.outputAmount.currency,
          chainName: getFullChainNameById(order.trade.outputAmount.currency.chainId),
        },

        order,
        originalOrder,
        steps: [
          {
            type: CrossChainOrderStepType.SWAP_AT_SOURCE_CHAIN,
            status: CrossChainOrderStepStatus.SUCCESS,
            tx: {
              hash: '0x86286f6e38e49ec807e0cc6e37281d1f991e3f70a83e21435a1e94d30de89b88',
              chainId: 56,
            },
            inputCurrency: order.trade.inputAmount.currency, // Swap Source Currency
            outputCurrency: order.trade.outputAmount.currency, // Swap Destination Currency
            inputChainName: getFullChainNameById(order.trade.inputAmount.currency.chainId),
          },
          {
            type: CrossChainOrderStepType.BRIDGE,
            status: CrossChainOrderStepStatus.PARTIAL_SUCCESS,

            inputCurrency: order.trade.inputAmount.currency, // Bridge Currency (Previously Swap Destination Currency)
            inputChainName: getFullChainNameById(order.trade.inputAmount.currency.chainId),
            outputChainName: getFullChainNameById(order.trade.outputAmount.currency.chainId),
            failureMessage: t('Failed due to: %reason%', { reason: 'Insufficient balance' }),
          },
          {
            type: CrossChainOrderStepType.SWAP_AT_DESTINATION_CHAIN,
            status: CrossChainOrderStepStatus.FAILED,

            inputCurrency: order.trade.inputAmount.currency, // Swap Source Currency (Previously Bridge Currency)
            outputCurrency: order.trade.outputAmount.currency, // Swap Destination Currency
            outputChainName: getFullChainNameById(order.trade.outputAmount.currency.chainId),
            failureMessage: t('Failed due to: %reason%', { reason: 'Insufficient balance' }),
          },
        ],
      })
    }
  }, [t, order, originalOrder, orderData, setOrderData])

  if (orderStatus) {
    return <OrderResultModalContent />
  }

  return null
}
