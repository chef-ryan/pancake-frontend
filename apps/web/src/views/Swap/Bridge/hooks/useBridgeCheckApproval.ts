import { Currency, CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useCallback, useState } from 'react'
import { Address } from 'viem'
import { postBridgeCheckApproval, PostBridgeCheckApprovalResponse } from '../api'

export const useBridgeCheckApproval = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [approvalData, setApprovalData] = useState<PostBridgeCheckApprovalResponse | null>(null)
  const { account } = useAccountActiveChain()

  const checkApproval = useCallback(
    async (currencyAmountIn: CurrencyAmount<Currency>) => {
      if (!account) return null

      try {
        setIsLoading(true)
        const response = await postBridgeCheckApproval({
          currencyAmountIn,
          recipient: account as Address,
        })

        setApprovalData(response)
        return response
      } catch (error) {
        console.error('Bridge approval check error:', error)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [account],
  )

  const requiresApproval = Boolean(approvalData?.approval)

  return {
    checkApproval,
    approvalData,
    requiresApproval,
    isLoading,
  }
}
