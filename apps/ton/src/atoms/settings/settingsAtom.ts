import { Percent } from '@pancakeswap/swap-sdk-core'
import { DEFAULT_DEADLINE, DEFAULT_MULTIHOP_ENABLED, Slippage } from 'config/constants/settings'
import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export const settingsAtom = atomWithStorage('pcs:settings', {
  slippage: Slippage.DEFAULT,
  /**
   * Transaction Deadline in Minutes
   */
  transactionDeadline: DEFAULT_DEADLINE,

  allowMultihops: DEFAULT_MULTIHOP_ENABLED,
})

export const userSlippagePercentAtom = atom((get) => {
  const { slippage } = get(settingsAtom)
  return new Percent(slippage, 10_000)
})
