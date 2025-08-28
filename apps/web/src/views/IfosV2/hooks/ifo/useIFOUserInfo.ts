import { useQuery } from '@tanstack/react-query'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useLatestTxReceipt } from 'state/farmsV4/state/accountPositions/hooks/useLatestTxReceipt'
import useIfo from '../useIfo'

export type IFOUserInfo = {
  amountPool: bigint
  claimedPool: boolean
}

export const useIFOUserInfo = () => {
  const { chainId, account } = useAccountActiveChain()
  const { ifoContract } = useIfo()
  const latestTxReceipt = useLatestTxReceipt()

  return useQuery({
    queryKey: ['ifoUserInfo', account, chainId, latestTxReceipt],
    queryFn: async (): Promise<[IFOUserInfo, IFOUserInfo]> => {
      if (!account || !ifoContract) throw new Error('IFO contract not found')

      const [amountPools, claimedPools] = await ifoContract.read.viewUserInfo([
        account,
        [0, 1], // @note: hardcode for now, as we currently only support max 2 pool
      ])

      return [
        {
          amountPool: amountPools[0],
          claimedPool: claimedPools[0],
        },
        {
          amountPool: amountPools[1],
          claimedPool: claimedPools[1],
        },
      ]
    },
    enabled: !!account && !!ifoContract,
  })
}
