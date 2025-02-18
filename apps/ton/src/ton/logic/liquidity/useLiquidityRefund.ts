import { Currency } from '@pancakeswap/ton-v2-sdk'
import { beginCell, toNano } from '@ton/core'
import { SendTransactionRequest, useTonConnectUI } from '@tonconnect/ui-react'
import { useCallback } from 'react'
import { storeRefundMe } from 'ton/wrappers/tact_LpAccount'

interface LiquidityRefundProps {
  currency0: Currency
  currency1: Currency
  lpAccountAddress: string
}
export const useLiquidityRefund = ({ lpAccountAddress }: LiquidityRefundProps) => {
  const [tonUI] = useTonConnectUI()

  const refund = useCallback(() => {
    const payload = beginCell()
      .store(storeRefundMe({ $$type: 'RefundMe', queryId: 5n }))
      .endCell()

    const txRequest: SendTransactionRequest = {
      validUntil: Math.floor(Date.now() / 1000) + 60 * 60,
      messages: [
        {
          address: lpAccountAddress,
          amount: toNano('0.4').toString(),
          payload: payload.toBoc().toString('base64'),
        },
      ],
    }

    tonUI.sendTransaction(txRequest)
  }, [tonUI, lpAccountAddress])

  return { refund }
}
