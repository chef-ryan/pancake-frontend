import { TonChainId } from '@pancakeswap/ton-v2-sdk'
import { API_BASE_URL } from 'config/constants/endpoints'

const cache = new Map<string, string>()

export async function getPoolAddress(
  chainId: TonChainId,
  token0Address: string,
  token1Address: string,
): Promise<string> {
  const cacheKey = `poolAddress-${chainId}-${token0Address}-${token1Address}`
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!
  }

  const response = await fetch(
    `${API_BASE_URL}/poolAddress?chainId=${chainId}&token0=${token0Address}&token1=${token1Address}`,
  )
  if (!response.ok) {
    throw new Error(`Failed to fetch pool address for ${token0Address} and ${token1Address}`)
  }
  const { data } = await response.json()
  cache.set(cacheKey, data)
  return data
}

export async function getLpAccountAddress(
  chainId: TonChainId,
  userAddress: string,
  poolAddress: string,
): Promise<string> {
  const cacheKey = `lpAccountAddress-${chainId}-${userAddress}-${poolAddress}`
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!
  }

  const response = await fetch(
    `${API_BASE_URL}/lpAddresses?chainId=${chainId}&poolAddress=${poolAddress}&userAddress=${userAddress}`,
  )
  if (!response.ok) {
    throw new Error(`Failed to fetch lp account address for ${poolAddress}`)
  }
  const { data } = await response.json()
  cache.set(cacheKey, data.lpAccountAddress)
  return data.lpAccountAddress
}

export async function getLpWalletAddress(
  chainId: TonChainId,
  userAddress: string,
  poolAddress: string,
): Promise<string> {
  const cacheKey = `lpWalletAddress-${chainId}-${userAddress}-${poolAddress}`
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!
  }

  const response = await fetch(
    `${API_BASE_URL}/lpAddresses?chainId=${chainId}&poolAddress=${poolAddress}&userAddress=${userAddress}`,
  )
  if (!response.ok) {
    throw new Error(`Failed to fetch lp wallet address for ${poolAddress}`)
  }
  const { data } = await response.json()
  cache.set(cacheKey, data.lpWalletAddress)
  return data.lpWalletAddress
}
