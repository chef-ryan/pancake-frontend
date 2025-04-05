import { NextApiRequest, NextApiResponse } from 'next'
import { xChainSenderSDK } from './XChainSenderSDK'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // For now, we're not processing the request body since we're using hardcoded response
    // const body = req.body

    const calldata = await xChainSenderSDK.generateCalldata()
    const orderId = await xChainSenderSDK.getNextOrderId()

    // Return hardcoded response
    return res.status(200).json({
      transactionData: {
        router: xChainSenderSDK.contract.address,
        calldata,
      },
      gasFee: '482534913917',
      orderId,
    })
  } catch (error) {
    console.error('Error processing calldata request:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
