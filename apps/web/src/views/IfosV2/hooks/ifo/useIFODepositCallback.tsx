import { useTranslation } from '@pancakeswap/localization'
import type { Currency, CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { useToast } from '@pancakeswap/uikit'
import { ToastDescriptionWithTx } from 'components/Toast'
import useCatchTxError from 'hooks/useCatchTxError'
import { useCallback } from 'react'
import { useLatestTxReceipt } from 'state/farmsV4/state/accountPositions/hooks/useLatestTxReceipt'
import { isAddressEqual } from 'utils'
import { logger } from 'utils/datadog'
import { erc20Abi, WriteContractReturnType, zeroAddress } from 'viem'
import { userRejectedError } from 'views/Swap/V3Swap/hooks/useSendSwapTransaction'
import { useAccount, useWriteContract } from 'wagmi'
import useIfo from '../useIfo'
import { useIFOPoolInfo } from './useIFOPoolInfo'
import { useIFOUserInfo } from './useIFOUserInfo'

export const useIFODepositCallback = () => {
  const { ifoContract } = useIfo()
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { toastSuccess, toastWarning } = useToast()
  const [, setLatestTxReceipt] = useLatestTxReceipt()
  const pools = useIFOPoolInfo()
  const { fetchWithCatchTxError, loading: isPending } = useCatchTxError({ throwUserRejectError: true })
  const { refetch } = useIFOUserInfo()
  const { writeContractAsync } = useWriteContract()

  const deposit = useCallback(
    async (
      pid: number,
      amount: CurrencyAmount<Currency>,
      onFinish?: () => void,
    ): Promise<WriteContractReturnType | undefined> => {
      if (!account || !ifoContract?.write || (!pid && pid !== 0)) return

      const depositAddress = amount.currency.isNative ? zeroAddress : amount.currency.address
      const poolToken = pools[pid]?.poolToken

      if (!poolToken || !isAddressEqual(poolToken, depositAddress)) {
        console.error('Invalid pool token')
        return
      }
      const value = amount.currency.isNative ? amount.quotient : 0n
      const amountPool = amount.currency.isNative ? 0n : amount.quotient
      try {
        const receipt = await fetchWithCatchTxError(async () => {
          if (amount.currency.isToken) {
            await writeContractAsync({
              address: amount.currency.address,
              abi: erc20Abi,
              functionName: 'approve',
              args: [ifoContract.address, amount.quotient],
            })
          }
          // TODO: IFO v10 depositPool only takes amount and pid
          return ifoContract.write.depositPool([amountPool, pid], {
            account,
            chain: ifoContract.chain,
            value,
          })
        })
        if (receipt?.status) {
          setLatestTxReceipt(receipt)
          toastSuccess(t('Deposit successful'), <ToastDescriptionWithTx bscTrace txHash={receipt.transactionHash} />)
        }
      } catch (error) {
        if (userRejectedError(error)) {
          toastWarning(
            t('You canceled deposit'),
            t(`You didn't confirm %symbol% deposit in your wallet`, {
              symbol: amount.currency.symbol,
            }),
          )
        }
        console.error(error)
        logger.error(
          '[ifo]: Error deposit ',
          {
            error,
            account,
            chainId: ifoContract?.chain?.id,
            amount: amount?.quotient,
            address: ifoContract?.address,
          },
          error instanceof Error ? error : new Error('unknown error'),
        )
      } finally {
        onFinish?.()
        refetch()
      }
    },
    [
      account,
      ifoContract,
      pools,
      fetchWithCatchTxError,
      writeContractAsync,
      setLatestTxReceipt,
      toastSuccess,
      t,
      toastWarning,
      refetch,
    ],
  )

  return {
    deposit,
    isPending,
  }
}
