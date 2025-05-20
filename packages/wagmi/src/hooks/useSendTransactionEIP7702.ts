import { useCallback } from 'react'
import { useSendTransaction, type UseSendTransactionReturnType } from 'wagmi'
import type { SendTransactionParameters } from 'viem'

/**
 * Additional fields for an EIP-7702 transaction. The exact specification is
 * still being finalized, so this interface may change in the future.
 */
export interface EIP7702Transaction extends SendTransactionParameters {
  /**
   * Ephemeral contract code to execute for this transaction.
   * TODO: replace `string` with the proper type once the spec is final.
   */
  ephemeralCode?: string
}

/**
 * Wrapper around wagmi's `useSendTransaction` that exposes a helper for sending
 * EIP-7702 transactions. Currently this hook simply forwards the transaction to
 * `useSendTransaction`. Support for encoding the new transaction format should
 * be added once libraries are available.
 */
export function useSendTransactionEIP7702(): {
  sendEip7702TransactionAsync: UseSendTransactionReturnType['sendTransactionAsync']
} {
  const { sendTransactionAsync } = useSendTransaction()

  const sendEip7702TransactionAsync = useCallback<UseSendTransactionReturnType['sendTransactionAsync']>(
    async (args) => {
      // TODO: encode args using the EIP-7702 transaction format when supported
      return sendTransactionAsync(args)
    },
    [sendTransactionAsync],
  )

  return {
    sendEip7702TransactionAsync,
  }
}
