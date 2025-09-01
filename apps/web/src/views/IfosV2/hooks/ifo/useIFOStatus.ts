import { type Currency, CurrencyAmount, Percent } from '@pancakeswap/swap-sdk-core'
import { useMemo } from 'react'
import { useIFOPoolInfo } from './useIFOPoolInfo'

export type IFOStatus = {
  progress: Percent
  currentStakedAmount: CurrencyAmount<Currency> | undefined
}

export const useIFOStatus = (): [IFOStatus, IFOStatus] => {
  const pools = useIFOPoolInfo()
  const pool0Info = pools[0]
  const pool1Info = pools[1]
  const progresses = useMemo(() => {
    return [
      pool0Info ? new Percent(pool0Info.totalAmountPool, pool0Info.raisingAmountPool) : new Percent(0, 100),
      pool1Info ? new Percent(pool1Info.totalAmountPool, pool1Info.raisingAmountPool) : new Percent(0, 100),
    ]
  }, [pool0Info, pool1Info])

  const currentStakedAmounts = useMemo(() => {
    return [
      pool0Info?.currency ? CurrencyAmount.fromRawAmount(pool0Info.currency, pool0Info.totalAmountPool) : undefined,
      pool1Info?.currency ? CurrencyAmount.fromRawAmount(pool1Info.currency, pool1Info.totalAmountPool) : undefined,
    ]
  }, [pool0Info, pool1Info])

  return [
    {
      progress: progresses[0],
      currentStakedAmount: currentStakedAmounts[0],
    },
    {
      progress: progresses[1],
      currentStakedAmount: currentStakedAmounts[1],
    },
  ]
}
