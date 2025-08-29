import { IfoStatus } from '@pancakeswap/ifos'
import { type Currency, CurrencyAmount, Percent, Price } from '@pancakeswap/swap-sdk-core'
import { UnsafeCurrency } from 'config/constants/types'
import { getStatusByTimestamp } from '../helpers'
import { useIFOStatus } from './useIFOStatus'
import { useIFOCurrencies } from './useIFOCurrencies'
import { PoolInfo, useIFOPoolInfo } from './useIFOPoolInfo'
import useIfo from '../useIfo'
import { useIFOUserStatus } from './useIFOUserStatus'

export type IFOPublicData = {
  startTime: number
  endTime: number
  status: IfoStatus
  // currencyPriceInUSD: BigNumber
  poolInfo?: PoolInfo
  plannedStartTime: number
  progress: Percent
  currentStakedAmount?: CurrencyAmount<Currency>
  maxStakePerUser?: CurrencyAmount<Currency>
  timeProgress: number
  duration: number
  pricePerToken: Price<Currency, Currency> | undefined
  stakeCurrency: UnsafeCurrency
  offeringCurrency: UnsafeCurrency
  raiseAmount: CurrencyAmount<Currency> | undefined
  saleAmount: CurrencyAmount<Currency> | undefined
  userClaimableAmount?: CurrencyAmount<Currency>
  userStakedAmount?: CurrencyAmount<Currency>
  userStakedRefund?: CurrencyAmount<Currency>
  userClaimed?: boolean
}

export const useIfoPublicData = (): [IFOPublicData, IFOPublicData] | [IFOPublicData] => {
  const { data: info } = useIFOPoolInfo()
  const { pool0Info, pool1Info, startTimestamp, endTimestamp } = info ?? {}
  const { stakeCurrency0, stakeCurrency1, offeringCurrency } = useIFOCurrencies()
  const [status0, status1] = useIFOStatus()
  const { info } = useIfo()
  const { pricePerTokens, raiseAmounts, saleAmounts, maxStakePerUsers } = info
  const [userStatus0, userStatus1] = useIFOUserStatus()

  const {
    stakedAmount: userStakedAmount,
    stakeRefund: userStakedRefund,
    claimableAmount: userClaimableAmount,
    claimed: userClaimed,
  } = userStatus0 ?? {}

  const startTime = Number(startTimestamp) || 0
  const endTime = Number(endTimestamp) || 0 // 1737407928
  const now = Math.floor(Date.now() / 1000)
  const status = getStatusByTimestamp(now, startTime, endTime)

  const duration = startTime - endTime

  const timeProgress = status === 'live' ? ((now - startTime) / duration) * 100 : 0

  return [
    {
      startTime,
      endTime,
      status,
      poolInfo: pool0Info,
      plannedStartTime: startTimestamp ? startTimestamp - 432000 : 0, // five days before
      progress: status0.progress,
      currentStakedAmount: status0.currentStakedAmount,
      maxStakePerUser: maxStakePerUsers[0],
      timeProgress,
      duration,
      pricePerToken: pricePerTokens[0],
      stakeCurrency: stakeCurrency0,
      offeringCurrency,
      raiseAmount: raiseAmounts[0],
      saleAmount: saleAmounts[0],
      userStakedAmount,
      userStakedRefund,
      userClaimableAmount,
      userClaimed,
    },
    {
      startTime,
      endTime,
      status,
      poolInfo: pool1Info,
      plannedStartTime: startTimestamp ? startTimestamp - 432000 : 0, // five days before
      progress: status1.progress,
      currentStakedAmount: status1.currentStakedAmount,
      maxStakePerUser: maxStakePerUsers[1],
      timeProgress,
      duration,
      pricePerToken: pricePerTokens[1],
      stakeCurrency: stakeCurrency1,
      offeringCurrency,
      raiseAmount: raiseAmounts[1],
      saleAmount: saleAmounts[1],
      userStakedAmount: userStatus1?.stakedAmount,
      userStakedRefund: userStatus1?.stakeRefund,
      userClaimableAmount: userStatus1?.claimableAmount,
      userClaimed: userStatus1?.claimed,
    },
  ]
}
