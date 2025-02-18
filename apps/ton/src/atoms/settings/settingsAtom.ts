import { DEFAULT_DEADLINE, DEFAULT_MULTIHOP_ENABLED, Slippage } from 'config/constants/settings'
import { atomWithStorage } from 'jotai/utils'

export const settingsAtom = atomWithStorage('pcs:settings', {
  slippage: Slippage.DEFAULT,
  /**
   * Transaction Deadline in Minutes
   */
  transactionDeadline: DEFAULT_DEADLINE,

  allowMultihops: DEFAULT_MULTIHOP_ENABLED,
})
