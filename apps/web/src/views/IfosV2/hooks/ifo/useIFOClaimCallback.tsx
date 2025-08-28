import { useTranslation } from '@pancakeswap/localization'
import { useToast } from '@pancakeswap/uikit'
import { ToastDescriptionWithTx } from 'components/Toast'
import useCatchTxError from 'hooks/useCatchTxError'
import { useCallback } from 'react'
import { useLatestTxReceipt } from 'state/farmsV4/state/accountPositions/hooks/useLatestTxReceipt'
import { logGTMIfoClaimEvent } from 'utils/customGTMEventTracking'
import { isUserRejected } from 'utils/sentry'
import { useAccount } from 'wagmi'
import { useIFOContract } from './useIFOContract'
import { useIFOUserInfo } from './useIFOUserInfo'

export const useIFOClaimCallback = () => {
  const ifoContract = useIFOContract()
  const { t } = useTranslation()
  const { address: account } = useAccount()
  const { toastSuccess, toastWarning } = useToast()
  const { fetchWithCatchTxError, loading: isPending } = useCatchTxError({ throwUserRejectError: true })
  const { refetch } = useIFOUserInfo()
  const [, setLatestTxReceipt] = useLatestTxReceipt()

  const claim = useCallback(
    async (pid: number, onFinish?: () => void) => {
      if (!account || !ifoContract || (!pid && pid !== 0)) return
      try {
        const receipt = await fetchWithCatchTxError(() =>
          ifoContract.write.harvestPool([pid], {
            account,
            chain: ifoContract.chain,
          }),
        )
        if (receipt?.status) {
          setLatestTxReceipt(receipt)
          toastSuccess(t('Claim successful'), <ToastDescriptionWithTx bscTrace txHash={receipt.transactionHash} />)
          logGTMIfoClaimEvent()
        }
      } catch (error) {
        if (isUserRejected(error)) {
          toastWarning(t('You canceled claim'))
        }
      } finally {
        refetch()
        onFinish?.()
      }
    },
    [account, ifoContract, fetchWithCatchTxError, setLatestTxReceipt, toastSuccess, t, toastWarning, refetch],
  )

  return { claim, isPending }
}
