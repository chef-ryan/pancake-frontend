import { ChainId } from '@pancakeswap/chains'
import { NextApiHandler } from 'next'
import { BridgeRoute } from './type'

const ACROSS_API_URL = 'https://app.across.to/api/available-routes'

// Define allowed chain IDs
const ALLOWED_CHAIN_IDS = [
  ChainId.ARBITRUM_ONE, // Arbitrum
  ChainId.BASE, // Base
  ChainId.BSC, // BSC
]

const handler: NextApiHandler = async (req, res) => {
  try {
    // Fetch data from Across API
    const response = await fetch(ACROSS_API_URL)
    const data: BridgeRoute[] = await response.json()

    // Filter routes to only include allowed chains
    const filteredRoutes = data.filter(
      (route) =>
        ALLOWED_CHAIN_IDS.includes(route.originChainId) && ALLOWED_CHAIN_IDS.includes(route.destinationChainId),
    )

    // Set cache control headers
    res.setHeader('Cache-Control', 'no-store, max-age=0')

    // Return the filtered data
    return res.status(200).json(filteredRoutes)
  } catch (error) {
    console.error('Error fetching available routes:', error)
    return res.status(500).json({ error: 'Failed to fetch available routes' })
  }
}

export default handler
