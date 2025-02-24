import { TonChainId } from '@pancakeswap/ton-v2-sdk'
import { TON_API } from 'config/constants/endpoints'
import { NextApiRequest, NextApiResponse } from 'next'

export interface TokenResponse {
  mintable: boolean
  total_supply: string
  admin: {
    address: string
    is_scam: boolean
    is_wallet: boolean
  }
  preview: string
  verification: string
  holders_count: number
  metadata: Metadata
}

export interface Metadata {
  address: string
  name: string
  symbol: string
  decimals: string
  image: string
  description: string
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { address } = req.query
  const chainId = Number(req.query.chainId)

  try {
    if (!chainId || !address || (chainId !== TonChainId.Mainnet && chainId !== TonChainId.Testnet)) {
      throw new Error('Invalid chainId or token address')
    }

    const result = await fetch(`${TON_API[chainId]}/v2/jettons/${address}`)
    if (!result.ok) throw new Error(`Failed to fetch token data for ${address} on chain ${chainId}`)
    const data: TokenResponse = await result.json()

    // Cache result for 1 day
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate')

    res.status(200).json(data)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to fetch token data' })
  }
}
