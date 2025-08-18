import { useCallback, useRef, Dispatch, SetStateAction } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { createWalletClient, custom, Address } from 'viem'
import { eip5792Actions } from 'viem/experimental'
import { useTranslation } from '@pancakeswap/localization'
import { useToast } from '@pancakeswap/uikit'
import { useEIP5792Status } from 'hooks/useIsEIP5792Supported'
import { PriceOrder } from '@pancakeswap/price-api-sdk'
import { CurrencyAmount, Token } from '@pancakeswap/swap-sdk-core'
import { ConfirmModalState } from '@pancakeswap/widgets-internal'
import { RetryableError, retry } from 'state/multicall/retry'
import { ChainId as EvmChainId } from '@pancakeswap/chains'
import { BatchCall, getBatchedTransaction as getBatchedTransactionHelper } from '../batchHelper'
import { eip5792UserRejectUpgradeError, userRejectedError } from '../useSendSwapTransaction'
import { ConfirmAction } from './step.type'

interface UseBatchTransactionArgs {
  actions: { [k in ConfirmModalState]: ConfirmAction }
  chainId?: number
  amountToApprove?: CurrencyAmount<Token>
  spender?: Address
  order?: PriceOrder
  showError: (message: string) => void
  setConfirmState: Dispatch<SetStateAction<ConfirmModalState>>
  setTxHash: Dispatch<SetStateAction<string | undefined>>
  resetState: () => void
}

export const useBatchTransaction = ({
  actions,
  chainId,
  amountToApprove,
  spender,
  order,
  showError,
  setConfirmState,
  setTxHash,
  resetState,
}: UseBatchTransactionArgs) => {
  const { connector } = useAccount()
  const { data: walletClient } = useWalletClient({ chainId })
  const eip5792Status = useEIP5792Status()
  const { toastError } = useToast()
  const { t } = useTranslation()

  const performEip5792Lock = useRef(false)

  const getBatchedTransaction = useCallback(
    (steps: ConfirmModalState[]) =>
      getBatchedTransactionHelper(steps, actions, chainId as number, amountToApprove, spender, order),
    [
      actions,
      amountToApprove?.currency.address,
      amountToApprove?.currency.isToken,
      amountToApprove?.quotient,
      chainId,
      order,
      spender,
    ],
  )

  const sendBatchedTransaction = useCallback(
    async (calls: BatchCall[]) => {
      if (!walletClient?.transport || !spender) {
        console.error('Missing required parameters')
        return null
      }

      const provider = await connector?.getProvider()
      if (!provider) return null

      const client = createWalletClient({
        transport: custom(provider as any),
        account: walletClient.account,
        chain: walletClient.chain,
      }).extend(eip5792Actions())

      try {
        const result = await client.sendCalls({
          calls,
          forceAtomic: true,
        })

        if (!result.id) {
          console.error('No transaction ID returned')
          return null
        }

        return { id: result.id, client } as const
      } catch (error) {
        console.warn('Error sending batched transaction:', error)
        if (userRejectedError(error)) {
          showError('Transaction rejected')
        } else if (!eip5792UserRejectUpgradeError(error)) {
          const errorMsg = typeof error === 'string' ? error : (error as any)?.message
          showError(errorMsg)
          toastError(t('Failed'), errorMsg)
        }
        throw error
      }
    },
    [connector, walletClient, spender, t, toastError, showError],
  )

  const canCallActionBatched = useCallback(
    (steps: ConfirmModalState[]) => {
      if (!walletClient?.transport || !spender) {
        return false
      }
      if (chainId === EvmChainId.BASE) {
        return false
      }
      if (eip5792Status === 'unsupported' || steps.length <= 1) {
        return false
      }
      const calls = getBatchedTransaction(steps)
      if (!calls || calls.length < steps.length) {
        return false
      }
      return true
    },
    [eip5792Status, getBatchedTransaction, walletClient?.transport, spender, chainId],
  )

  const callActionBatched = useCallback(
    async (steps: ConfirmModalState[]) => {
      setTxHash(undefined)
      setConfirmState(ConfirmModalState.PENDING_CONFIRMATION)
      const calls = getBatchedTransaction(steps)
      if (!calls) {
        resetState()
        return
      }
      try {
        const result = await sendBatchedTransaction(calls)
        if (!result?.id || !result.client) {
          return
        }
        const { promise: statusPromise } = retry(
          async () => {
            const status = await result.client.getCallsStatus({ id: result.id })
            if (status.status === 'failure') {
              throw new Error('Transaction failed')
            }
            if (status.status !== 'success') {
              throw new RetryableError()
            }
            return status
          },
          { n: 3, minWait: 2000, maxWait: 3500 },
        )

        const status = await statusPromise
        if (status.status === 'success') {
          setTxHash(status.receipts?.[0]?.transactionHash)
          setConfirmState(ConfirmModalState.COMPLETED)
        }
      } catch (error) {
        console.warn('[5792] Failed to call batched action:', error)
        if (userRejectedError(error) || eip5792UserRejectUpgradeError(error)) {
          throw error
        }
      }
    },
    [setConfirmState, resetState, setTxHash, getBatchedTransaction, sendBatchedTransaction],
  )

  return { canCallActionBatched, callActionBatched, performEip5792Lock }
}
