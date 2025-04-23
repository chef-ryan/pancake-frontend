import { Currency, CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { useQuery } from '@tanstack/react-query'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import { useMemo } from 'react'
import { Address } from 'viem'
import { postBridgeCheckApproval, PostBridgeCheckApprovalResponse } from '../api'

type BridgeCheckApprovalData = PostBridgeCheckApprovalResponse | null | undefined

export const useBridgeCheckApproval = ({ currencyAmountIn }: { currencyAmountIn?: CurrencyAmount<Currency> }) => {
  const { account } = useAccountActiveChain()

  const isNativeCurrency = currencyAmountIn?.currency?.isNative

  const {
    data: approvalData,
    error,
    isLoading,
    refetch,
  } = useQuery<BridgeCheckApprovalData>({
    queryKey: [
      'bridge-check-approval',
      account,
      isNativeCurrency ? 'native' : currencyAmountIn?.currency?.wrapped.address,
      currencyAmountIn?.currency?.chainId,
      currencyAmountIn?.quotient.toString(),
    ],
    queryFn: async () => {
      if (!currencyAmountIn || !account) return Promise.resolve(null)

      if (isNativeCurrency) {
        return {
          approval: {
            isRequired: false,
          },
        }
      }

      try {
        const response = await postBridgeCheckApproval({
          currencyAmountIn,
          recipient: account as Address,
        })

        return response
      } catch (err) {
        console.error('Bridge approval check error:', err)
        throw err
      }
    },
    enabled: !!currencyAmountIn && !!account,
    retry: 1,
    // If the query fails, return an error object
    throwOnError: false,
  })

  const isRequiredFromResponse = approvalData?.approval?.isRequired

  // NOTE: when approval response returns error, we should flag it as requiring approval to show the approval error
  const requiresApproval =
    typeof isRequiredFromResponse === 'boolean' ? isRequiredFromResponse : Boolean(approvalData?.error?.code || error)

  const finalApprovalData: BridgeCheckApprovalData = useMemo(() => {
    if (error) {
      return {
        error: {
          code: '500',
          message: `Bridge approval check failed: ${error.message}`,
        },
      }
    }

    return approvalData
  }, [approvalData, error])

  return useMemo(
    () => ({
      approvalData: finalApprovalData,
      requiresApproval,
      isLoading,
      refetch,
    }),
    [finalApprovalData, requiresApproval, isLoading, refetch],
  )
}
