import { atom, useAtom } from 'jotai'
import { useCallback } from 'react'

interface TransactionReceipt {
  hash: string
  confirmedTime: number
}
export const txReceiptAtom = atom<TransactionReceipt | null>(null)

export const useLatestTxReceipt = () => {
  const [latestTxReceipt, setTxReceipt] = useAtom(txReceiptAtom)

  const setLatestTxReceipt = useCallback(
    (receipt?: Pick<TransactionReceipt, 'hash'> | null) => {
      if (receipt?.hash) {
        setTxReceipt({ hash: receipt.hash, confirmedTime: Date.now() })
      }
    },
    [setTxReceipt],
  )

  return [latestTxReceipt, setLatestTxReceipt] as const
}
