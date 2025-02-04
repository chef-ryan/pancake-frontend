import { formatBigInt } from '@pancakeswap/utils/formatBalance'

export const formatBalance = (balance: bigint, decimals = 9) => {
  return formatBigInt(balance, decimals, decimals)
}
