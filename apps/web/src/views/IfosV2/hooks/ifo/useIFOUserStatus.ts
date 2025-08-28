import { type Currency, CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useLatestTxReceipt } from 'state/farmsV4/state/accountPositions/hooks/useLatestTxReceipt'
import { useAccount } from 'wagmi'
import useIfo from '../useIfo'
import { useIFOCurrencies } from './useIFOCurrencies'
import { useIFOPoolInfo } from './useIFOPoolInfo'
import { useIFOUserInfo } from './useIFOUserInfo'

export type IFOUserStatus = {
  stakedAmount: CurrencyAmount<Currency> | undefined
  stakeRefund: CurrencyAmount<Currency> | undefined
  claimableAmount: CurrencyAmount<Currency> | undefined
  claimed: boolean | undefined
}

export const useIFOUserStatus = (): [IFOUserStatus | undefined, IFOUserStatus | undefined] => {
  const { data: userInfo } = useIFOUserInfo()
  const { data: poolInfo } = useIFOPoolInfo()
  const { pool0Info, pool1Info } = poolInfo ?? {}
  const { data: offeringAndRefundingAmounts } = useViewUserOfferingAndRefundingAmounts()
  const { stakeCurrency0, stakeCurrency1, offeringCurrency } = useIFOCurrencies()

  const stakedAmounts = useMemo(() => {
    if (!stakeCurrency0 || !userInfo) return [undefined, undefined]
    return [
      CurrencyAmount.fromRawAmount(stakeCurrency0, userInfo[0].amountPool),
      stakeCurrency1 ? CurrencyAmount.fromRawAmount(stakeCurrency1, userInfo[1].amountPool) : undefined,
    ]
  }, [stakeCurrency0, stakeCurrency1, userInfo])

  const claimed = useMemo(() => {
    if (!userInfo) return [undefined, undefined]
    return [userInfo[0].claimedPool, userInfo[1].claimedPool]
  }, [userInfo])

  const stakeRefund = useMemo(() => {
    if (!stakeCurrency0) return [undefined, undefined]
    return [
      CurrencyAmount.fromRawAmount(stakeCurrency0, offeringAndRefundingAmounts?.[0].userRefundingAmount ?? 0n),
      stakeCurrency1
        ? CurrencyAmount.fromRawAmount(stakeCurrency1, offeringAndRefundingAmounts?.[1].userRefundingAmount ?? 0n)
        : undefined,
    ]
  }, [stakeCurrency0, stakeCurrency1, offeringAndRefundingAmounts])

  const claimableAmount = useMemo(() => {
    if (!offeringCurrency) return [undefined, undefined]
    return [
      CurrencyAmount.fromRawAmount(offeringCurrency, offeringAndRefundingAmounts?.[0].userOfferingAmount ?? 0n),
      CurrencyAmount.fromRawAmount(offeringCurrency, offeringAndRefundingAmounts?.[1].userOfferingAmount ?? 0n),
    ]
  }, [offeringCurrency, offeringAndRefundingAmounts])

  return [
    pool0Info
      ? {
          stakedAmount: stakedAmounts[0],
          stakeRefund: stakeRefund[0],
          claimableAmount: claimableAmount[0],
          claimed: claimed[0],
        }
      : undefined,
    pool1Info
      ? {
          stakedAmount: stakedAmounts[1],
          stakeRefund: stakeRefund[1],
          claimableAmount: claimableAmount[1],
          claimed: claimed[1],
        }
      : undefined,
  ]
}

export type UserOfferingAndRefundingAmounts = {
  userOfferingAmount: bigint
  userRefundingAmount: bigint
}

const useViewUserOfferingAndRefundingAmounts = () => {
  const { ifoContract } = useIfo()
  const { address: account } = useAccount()
  const latestTxReceipt = useLatestTxReceipt()

  return useQuery({
    queryKey: ['ifoUserOfferingAndRefundingAmounts', ifoContract?.address, account, latestTxReceipt],
    queryFn: async (): Promise<[UserOfferingAndRefundingAmounts, UserOfferingAndRefundingAmounts]> => {
      if (!ifoContract || !account) throw new Error('IFO contract not found')
      const [[userOfferingAmount0, userRefundingAmount0], [userOfferingAmount1, userRefundingAmount1]] =
        await ifoContract.read.viewUserOfferingAndRefundingAmountsForPools([account, [0, 1]])

      return [
        {
          userOfferingAmount: userOfferingAmount0,
          userRefundingAmount: userRefundingAmount0,
        },
        {
          userOfferingAmount: userOfferingAmount1,
          userRefundingAmount: userRefundingAmount1,
        },
      ]
    },
    enabled: !!account && !!ifoContract,
    placeholderData: (prev) => prev,
  })
}
