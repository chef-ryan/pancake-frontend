import { NextApiHandler } from 'next'
import { xChainSenderSDK } from './XChainSenderSDK'

const handler: NextApiHandler = async (req, res) => {
  // Call getNextOrderId from the contract
  const nextOrderId = await xChainSenderSDK.getNextOrderId()

  // Set appropriate headers
  res.setHeader('Cache-Control', 'no-store, max-age=0')

  // Return the nextOrderId in the response
  return res.status(200).json({ nextOrderId })
}

export default handler
