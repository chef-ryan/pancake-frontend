import { TonChainId } from '@pancakeswap/ton-v2-sdk'
import { TON_API } from 'config/constants/endpoints'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { address } = req.query
  const chainId = Number(req.query.chainId)

  try {
    if (!chainId || !address || (chainId !== TonChainId.Mainnet && chainId !== TonChainId.Testnet)) {
      throw new Error('Missing chainId or token address')
    }
    const result = await fetch(`${TON_API[chainId]}/v2/jettons/${address}`)
    if (!result.ok) throw new Error(`Failed to fetch token data for ${address} on chain ${chainId}`)
    const data = await result.json()

    // Cache result for 1 day
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate')

    res.status(200).json(data)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Failed to fetch token data' })
  }
}
