import { type Currency, CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useLatestTxReceipt } from 'state/farmsV4/state/accountPositions/hooks/useLatestTxReceipt'
import { useAccount } from 'wagmi'
import useIfo from '../useIfo'
import { useIFOUserInfo } from './useIFOUserInfo'

export type IFOUserStatus = {
  stakedAmount: CurrencyAmount<Currency> | undefined
  stakeRefund: CurrencyAmount<Currency> | undefined
  claimableAmount: CurrencyAmount<Currency> | undefined
  claimed: boolean | undefined
}

export const useIFOUserStatus = (): [IFOUserStatus | undefined, IFOUserStatus | undefined] => {
  const { data: userInfo } = useIFOUserInfo()
  const { pools, info } = useIfo()
  const pool0Info = pools[0]
  const pool1Info = pools[1]
  const { data: offeringAndRefundingAmounts } = useViewUserOfferingAndRefundingAmounts()

  const stakedAmounts = useMemo(() => {
    if (!userInfo) return [undefined, undefined]
    return [
      pool0Info?.stakeCurrency
        ? CurrencyAmount.fromRawAmount(pool0Info.stakeCurrency, userInfo[0].amountPool)
        : undefined,
      pool1Info?.stakeCurrency
        ? CurrencyAmount.fromRawAmount(pool1Info.stakeCurrency, userInfo[1].amountPool)
        : undefined,
    ]
  }, [userInfo, pool0Info?.stakeCurrency, pool1Info?.stakeCurrency])

  const claimed = useMemo(() => {
    if (!userInfo) return [undefined, undefined]
    return [userInfo[0].claimedPool, userInfo[1].claimedPool]
  }, [userInfo])

  const stakeRefund = useMemo(() => {
    return [
      pool0Info?.stakeCurrency
        ? CurrencyAmount.fromRawAmount(
            pool0Info.stakeCurrency,
            offeringAndRefundingAmounts?.[0].userRefundingAmount ?? 0n,
          )
        : undefined,
      pool1Info?.stakeCurrency
        ? CurrencyAmount.fromRawAmount(
            pool1Info.stakeCurrency,
            offeringAndRefundingAmounts?.[1].userRefundingAmount ?? 0n,
          )
        : undefined,
    ]
  }, [pool0Info?.stakeCurrency, pool1Info?.stakeCurrency, offeringAndRefundingAmounts])

  const claimableAmount = useMemo(() => {
    if (!info) return [undefined, undefined]
    const { offeringCurrency } = info
    return [
      CurrencyAmount.fromRawAmount(offeringCurrency!, offeringAndRefundingAmounts?.[0].userOfferingAmount ?? 0n),
      CurrencyAmount.fromRawAmount(offeringCurrency!, offeringAndRefundingAmounts?.[1].userOfferingAmount ?? 0n),
    ]
  }, [info, offeringAndRefundingAmounts])

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
