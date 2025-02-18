import { Currency } from '@pancakeswap/ton-v2-sdk'
import { beginCell, toNano } from '@ton/core'
import { SendTransactionRequest, useTonConnectUI } from '@tonconnect/ui-react'
import { resetAppModalAtom } from 'atoms/modals/appModalAtom'
import { setTransactionModalAtom } from 'atoms/modals/transactionModalAtom'
import { ActionType } from 'components/Modals/ActionModal'
import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'
import { addressAtom } from 'ton/atom/addressAtom'
import { generateQueryId } from 'ton/utils/generateQueryId'
import { getTransactionByBOC } from 'ton/utils/transaction'
import { storeRefundMe } from 'ton/wrappers/tact_LpAccount'

interface LiquidityRefundProps {
  currency0?: Currency
  currency1?: Currency
  lpAccountAddress: string
}
export const useLiquidityRefund = ({ lpAccountAddress, currency0, currency1 }: LiquidityRefundProps) => {
  const [tonUI] = useTonConnectUI()

  const userAddress = useAtomValue(addressAtom)

  const setTxnModal = useSetAtom(setTransactionModalAtom)
  const resetAppModal = useSetAtom(resetAppModalAtom)

  const refund = useCallback(async () => {
    try {
      setTxnModal({
        type: ActionType.ConfirmTransaction,
        currency0,
        currency1,
        isOpen: true,
      })

      const payload = beginCell()
        .store(storeRefundMe({ $$type: 'RefundMe', queryId: generateQueryId() }))
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

      const { boc } = await tonUI.sendTransaction(txRequest)
      if (boc) {
        setTxnModal({
          type: ActionType.AddLiquiditySubmitted,
          currency0,
          currency1,
        })
      }
      const hash = await getTransactionByBOC(userAddress, boc)
      if (hash) {
        setTxnModal({
          type: ActionType.AddLiquidityComplete,
          currency0,
          currency1,
          hash,
        })
      }
    } catch (e) {
      console.error(e)
      resetAppModal()
    }
  }, [tonUI, lpAccountAddress, userAddress, currency0, currency1, setTxnModal, resetAppModal])

  return { refund }
}
