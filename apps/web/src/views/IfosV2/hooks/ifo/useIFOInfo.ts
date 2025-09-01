import type { IfoStatus } from '@pancakeswap/ifos'
import { type Currency, CurrencyAmount, Price } from '@pancakeswap/swap-sdk-core'
import dayjs from 'dayjs'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useActiveChainId } from 'hooks/useActiveChainId'
import { getViemClients } from 'utils/viem'
import { getStatusByTimestamp } from '../helpers'
import { useIFOCurrencies } from './useIFOCurrencies'
import { useIFOPoolInfo } from './useIFOPoolInfo'
import { useIfoV2Context } from '../../contexts/IfoV2Context'

export type IfoInfo = {
  totalSales: [bigint, bigint]
  startTimestamp: number
  endTimestamp: number
  duration: number
  pricePerTokens: [Price<Currency, Currency> | undefined, Price<Currency, Currency> | undefined]
  maxStakePerUsers: [CurrencyAmount<Currency> | undefined, CurrencyAmount<Currency> | undefined]
  raiseAmounts: [CurrencyAmount<Currency> | undefined, CurrencyAmount<Currency> | undefined]
  saleAmounts: [CurrencyAmount<Currency> | undefined, CurrencyAmount<Currency> | undefined]
  totalSalesAmount: CurrencyAmount<Currency> | undefined
  status: IfoStatus
}

type InfoFN = () => IfoInfo
export const useIFOInfo: InfoFN = () => {
  const pools = useIFOPoolInfo()
  const pool0Info = pools[0]
  const pool1Info = pools[1]
  const { offeringCurrency } = useIFOCurrencies()
  const { chainId } = useActiveChainId()
  const { ifoContract } = useIfoV2Context()
  const { data: timestamps } = useQuery({
    queryKey: ['ifoTimestamps', chainId],
    queryFn: async (): Promise<{ startTimestamp: number; endTimestamp: number }> => {
      const publicClient = getViemClients({ chainId })
      if (!ifoContract || !publicClient) throw new Error('IFO contract not found')
      const [startTimestamp, endTimestamp] = await publicClient.multicall({
        contracts: [
          { address: ifoContract.address, abi: ifoContract.abi, functionName: 'startTimestamp' },
          { address: ifoContract.address, abi: ifoContract.abi, functionName: 'endTimestamp' },
        ],
        allowFailure: false,
      })
      return { startTimestamp: Number(startTimestamp), endTimestamp: Number(endTimestamp) }
    },
    enabled: !!ifoContract,
  })
  const now = dayjs().unix()

  return useMemo<IfoInfo>(() => {
    const info = {
      totalSales: [pool0Info?.offeringAmountPool ?? 0n, pool1Info?.offeringAmountPool ?? 0n],
      startTimestamp: timestamps?.startTimestamp ?? 0,
      endTimestamp: timestamps?.endTimestamp ?? 0,
      duration:
        timestamps?.endTimestamp && timestamps?.startTimestamp
          ? timestamps.endTimestamp - timestamps.startTimestamp
          : 0,
      pricePerTokens: [pool0Info?.price, pool1Info?.price],
      maxStakePerUsers: [
        pool0Info?.currency ? CurrencyAmount.fromRawAmount(pool0Info.currency, pool0Info.capPerUserInLP) : undefined,
        pool1Info?.currency ? CurrencyAmount.fromRawAmount(pool1Info.currency, pool1Info.capPerUserInLP) : undefined,
      ],
      raiseAmounts: [pool0Info?.raise, pool1Info?.raise],
      saleAmounts: offeringCurrency
        ? [
            CurrencyAmount.fromRawAmount(offeringCurrency, pool0Info?.offeringAmountPool ?? 0n),
            CurrencyAmount.fromRawAmount(offeringCurrency, pool1Info?.offeringAmountPool ?? 0n),
          ]
        : [undefined, undefined],
      totalSalesAmount: offeringCurrency
        ? CurrencyAmount.fromRawAmount(offeringCurrency, pool0Info?.offeringAmountPool ?? 0n).add(
            CurrencyAmount.fromRawAmount(offeringCurrency, pool1Info?.offeringAmountPool ?? 0n),
          )
        : undefined,
      status: getStatusByTimestamp(now, timestamps?.startTimestamp, timestamps?.endTimestamp),
    } as IfoInfo
    return info
  }, [
    pool0Info?.offeringAmountPool,
    pool0Info?.raisingAmountPool,
    pool0Info?.capPerUserInLP,
    pool1Info?.offeringAmountPool,
    pool1Info?.raisingAmountPool,
    pool1Info?.capPerUserInLP,
    timestamps?.startTimestamp,
    timestamps?.endTimestamp,
    offeringCurrency,
    pool0Info?.currency,
    pool1Info?.currency,
    pool0Info?.price,
    pool1Info?.price,
    pool0Info?.raise,
    pool1Info?.raise,
    now,
  ])
}
