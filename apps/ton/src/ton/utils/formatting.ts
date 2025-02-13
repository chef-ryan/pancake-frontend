import { formatBigInt } from '@pancakeswap/utils/formatBalance'

export const formatBalance = (balance: bigint, decimals = 9) => {
  return formatBigInt(balance, decimals, decimals)
}

export const parseUnits = (value: bigint | string, decimals = 9) => {
  return BigInt(value) * BigInt(10 ** decimals)
}
