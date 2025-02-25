import { formatBigInt } from '@pancakeswap/utils/formatBalance'
import { parseUnits as parseUnitsViem } from '@pancakeswap/utils/viem/parseUnits'
import BN from 'bignumber.js'

export const formatBalance = (balance: bigint, decimals = 9) => {
  return formatBigInt(balance, decimals, decimals)
}

export const formatBigNumber = (value: BN, decimals = 9) => {
  return value.dividedBy(new BN(10).pow(decimals)).toFixed(decimals)
}

export const parseUnits = (value: bigint | string, decimals = 9) => {
  return parseUnitsViem(value.toString(), decimals)
}
