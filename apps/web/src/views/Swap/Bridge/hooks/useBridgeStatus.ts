import { CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { formatScientificToDecimal } from '@pancakeswap/utils/formatNumber'
import { useQuery } from '@tanstack/react-query'
import { useCurrencyByChainId } from 'hooks/Tokens'
import { useMemo } from 'react'
import { getBridgeStatus } from '../api'
import { ActiveBridgeOrderMetadata, BridgeStatus, BridgeStatusData, BridgeStatusResponse, Command } from '../types'

export const bridgeStatusQueryKey = (chainId?: number, txHash?: string) => ['bridge-status', chainId, txHash]

export const useBridgeStatus = (
  chainId?: number,
  txHash?: string,
  metadata?: ActiveBridgeOrderMetadata['metadata'],
) => {
  const queryResult = useQuery({
    queryKey: bridgeStatusQueryKey(chainId, txHash),
    queryFn: () => (chainId && txHash ? getBridgeStatus(chainId, txHash) : undefined),
    refetchInterval: (query) =>
      !query.state.data ||
      query.state.data?.status === BridgeStatus.PENDING ||
      query.state.data?.status === BridgeStatus.BRIDGE_PENDING
        ? 3_000
        : 15_000,
    retry: 3,
    retryDelay: 1_000,
    enabled: !!chainId && !!txHash,
    notifyOnChangeProps: ['data', 'isFetching'],
  })

  const data: BridgeStatusResponse | undefined = useMemo(
    () =>
      metadata
        ? {
            ...(metadata as BridgeStatusResponse),
            ...queryResult.data,
          }
        : queryResult.data,
    [metadata, queryResult.data],
  )

  const inputCurrency = useCurrencyByChainId(data?.inputToken, data?.originChainId)
  const outputCurrency = useCurrencyByChainId(data?.outputToken, data?.destinationChainId)

  const inputCurrencyAmount = useMemo(() => {
    if (!inputCurrency || !data || !data?.inputAmount) return undefined
    return CurrencyAmount.fromRawAmount(inputCurrency, formatScientificToDecimal(data?.inputAmount))
  }, [inputCurrency, data?.inputAmount])

  const outputCurrencyAmount = useMemo(() => {
    if (!outputCurrency || !data || !data?.outputAmount) return undefined
    return CurrencyAmount.fromRawAmount(outputCurrency, formatScientificToDecimal(data?.outputAmount))
  }, [outputCurrency, data?.outputAmount])

  const feesBreakdown = useMemo(() => {
    return {
      totalFeesUSD:
        data && data.data?.reduce((prev, curr) => (curr.metadata?.fee ? prev + Number(curr.metadata.fee) : prev), 0),
      swapFeesUSD:
        data &&
        data.data?.reduce(
          (prev, curr) => prev + (curr.command === Command.SWAP ? Number(curr.metadata?.fee || 0) : 0),
          0,
        ),
      bridgeFeesUSD: data && Number(data.data?.find((item) => item.command === Command.BRIDGE)?.metadata?.fee || 0),
    }
  }, [data])

  const bridgeStatusData: BridgeStatusData | undefined = useMemo(
    () =>
      data
        ? {
            ...data,
            inputCurrencyAmount,
            outputCurrencyAmount,
            feesBreakdown,
          }
        : undefined,
    [data, inputCurrencyAmount, outputCurrencyAmount],
  )

  return { data: bridgeStatusData, isLoading: queryResult.isFetching }
}
