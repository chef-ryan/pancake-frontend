import { formatBigInt } from '@pancakeswap/utils/formatBalance'
import { parseUnits as parseUnitsViem } from '@pancakeswap/utils/viem/parseUnits'

export const formatBalance = (balance: bigint, decimals = 9) => {
  return formatBigInt(balance, decimals, decimals)
}

export const parseUnits = (value: bigint | string, decimals = 9) => {
  return parseUnitsViem(value.toString(), decimals)
}
