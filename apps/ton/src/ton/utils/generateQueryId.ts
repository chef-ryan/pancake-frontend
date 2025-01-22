import { Address } from '@ton/core'

export function generateQueryId(userAddress: Address): bigint {
  const timestamp = BigInt(Date.now()) // Current time in milliseconds
  const randomPart = BigInt(Math.floor(Math.random() * 1000)) // Random 3 digits
  const addressPart = BigInt(parseInt(userAddress.toString().slice(-6), 16)) // Last 6 hex digits of the address
  return (timestamp * 1000n + randomPart) ^ addressPart
}
