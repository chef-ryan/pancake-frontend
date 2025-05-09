import { ApiV3Token } from '@raydium-io/raydium-sdk-v2'

export type RewardInfo = {
  weekly: string
  periodString: string
  periodDays: number
  unEmit: string
  mint: ApiV3Token
}
