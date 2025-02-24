import { Contracts, TonChainId, TonContractNames } from '@pancakeswap/ton-v2-sdk'
import { TonClient } from '@ton/ton'
import { NextApiRequest, NextApiResponse } from 'next'
import { TonEndPoints } from 'ton/context/endpoints'
import { parseAddress } from 'ton/utils/address'
import { JettonMasterUSDT } from 'ton/wrappers/tact_JettonMasterUSDT'
import { Router } from 'ton/wrappers/tact_Router'

const mainnetClient = new TonClient({
  endpoint: TonEndPoints[TonChainId.Mainnet],
})

const testnetClient = new TonClient({
  endpoint: TonEndPoints[TonChainId.Testnet],
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { token0, token1, chainId: chainId_ } = req.query

  const chainId: TonChainId = Number(chainId_)

  if (!chainId || !token0 || !token1 || (+chainId !== TonChainId.Mainnet && +chainId !== TonChainId.Testnet)) {
    return res.status(400).json({ error: 'Invalid query parameters' })
  }

  const client = chainId === TonChainId.Mainnet ? mainnetClient : testnetClient

  try {
    const token0Address = parseAddress(token0 as string)
    const token1Address = parseAddress(token1 as string)

    const routerAddress = parseAddress(Contracts[TonContractNames.PCSRouter][chainId].address)

    const [jettonWalletAddress0, jettonWalletAddress1] = await Promise.all([
      client.open(JettonMasterUSDT.fromAddress(token0Address)).getGetWalletAddress(routerAddress),
      client.open(JettonMasterUSDT.fromAddress(token1Address)).getGetWalletAddress(routerAddress),
    ])

    const poolAddress = await client
      .open(Router.fromAddress(routerAddress))
      .getGetPoolAddress(jettonWalletAddress0, jettonWalletAddress1)

    // Cache response for 1 week
    res.setHeader('Cache-Control', 'public, max-age=604800, s-maxage=604800, stale-while-revalidate')

    return res.status(200).json({ data: poolAddress.toString(), error: null })
  } catch (error: any) {
    return res.status(500).json({ data: null, error: `An error occurred: ${error?.message ?? error}` })
  }
}
