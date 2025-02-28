import { TonChainId } from '@pancakeswap/ton-v2-sdk'
import { TonClient } from '@ton/ton'
import { NextApiRequest, NextApiResponse } from 'next'
import { TonEndPoints } from 'ton/context/endpoints'
import { parseAddress } from 'ton/utils/address'
import { Pool } from 'ton/wrappers/tact_Pool'

const mainnetClient = new TonClient({
  endpoint: TonEndPoints[TonChainId.Mainnet],
})

const testnetClient = new TonClient({
  endpoint: TonEndPoints[TonChainId.Testnet],
})

/**
 * Return user's LpWallet and LpAccount addresses for a given pool
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { chainId: chainId_, poolAddress: poolAddress_, userAddress: userAddress_ } = req.query

  const chainId: TonChainId = Number(chainId_)

  if (
    !chainId ||
    !poolAddress_ ||
    !userAddress_ ||
    (+chainId !== TonChainId.Mainnet && +chainId !== TonChainId.Testnet)
  ) {
    return res.status(400).json({ error: 'Invalid query parameters' })
  }

  const client = chainId === TonChainId.Testnet ? testnetClient : mainnetClient

  const poolAddress = parseAddress(poolAddress_ as string)
  const userAddress = parseAddress(userAddress_ as string)

  try {
    const pool = client.open(Pool.fromAddress(poolAddress))

    const [lpWalletAddress, lpAccountAddress] = await Promise.all([
      pool.getGetWalletAddress(userAddress),
      pool.getGetLpAccountAddress(userAddress),
    ])

    // Cache response for 1 week
    res.setHeader('Cache-Control', 'public, max-age=604800, s-maxage=604800, stale-while-revalidate')

    return res.status(200).json({
      data: { lpWalletAddress: lpWalletAddress.toString(), lpAccountAddress: lpAccountAddress.toString() },
      error: null,
    })
  } catch (error: any) {
    return res.status(500).json({ data: null, error: `An error occurred: ${error?.message ?? error}` })
  }
}
