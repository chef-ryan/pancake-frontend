import { TonChainId } from '@pancakeswap/ton-v2-sdk'

export async function getPoolAddress(
  chainId: TonChainId,
  token0Address: string,
  token1Address: string,
): Promise<string> {
  const response = await fetch(`/api/poolAddress?token0=${token0Address}&token1=${token1Address}&chainId=${chainId}`)
  if (!response.ok) {
    throw new Error(`Failed to fetch pool address for ${token0Address} and ${token1Address}`)
  }
  const { data } = await response.json()
  return data
}

export async function getLpAccountAddress(
  chainId: TonChainId,
  userAddress: string,
  poolAddress: string,
): Promise<string> {
  const response = await fetch(
    `/api/lpAddresses?chainId=${chainId}&poolAddress=${poolAddress}&userAddress=${userAddress}`,
  )
  if (!response.ok) {
    throw new Error(`Failed to fetch lp account address for ${poolAddress}`)
  }
  const { data } = await response.json()
  return data.lpAccountAddress
}

export async function getLpWalletAddress(
  chainId: TonChainId,
  userAddress: string,
  poolAddress: string,
): Promise<string> {
  const response = await fetch(
    `/api/lpAddresses?chainId=${chainId}&poolAddress=${poolAddress}&userAddress=${userAddress}`,
  )
  if (!response.ok) {
    throw new Error(`Failed to fetch lp wallet address for ${poolAddress}`)
  }
  const { data } = await response.json()
  return data.lpWalletAddress
}
