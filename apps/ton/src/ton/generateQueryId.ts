export function generateQueryId(): bigint {
  const timestamp = BigInt(Date.now()) // Current time in milliseconds
  const randomPart = BigInt(Math.floor(Math.random() * 1000)) // Random 3 digits
  return timestamp * 100000n + randomPart
}
