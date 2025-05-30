import { solToWSol } from '@raydium-io/raydium-sdk-v2'
import useSWR from 'swr'
import { shallow } from 'zustand/shallow'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Decimal from 'decimal.js'
import axios from '@/api/axios'
import { useAppStore } from '@/store'
import { debounce } from '@/utils/functionMethods'
import { isValidPublicKey } from '@/utils/publicKey'
import { quoteApi } from '@/utils/config/endpoint'
import { SwapType, QuoteRequest, QuoteResponse, ApiSuccessResponse } from './type'
import { useSwapStore } from './useSwapStore'

const fetcher =
  (data: QuoteRequest) =>
  async (url: string): Promise<QuoteResponse> =>
    axios.post(url, data)

export default function useSwap(props: {
  shouldFetch?: boolean
  inputMint?: string
  outputMint?: string
  amount?: string
  refreshInterval?: number
  slippageBps?: number
  swapType: SwapType
}) {
  const {
    inputMint: propInputMint = '',
    outputMint: propOutputMint = '',
    amount: propsAmount,
    slippageBps: propsSlippage,
    swapType,
    refreshInterval = 30 * 1000
  } = props || {}

  const [amount, setAmount] = useState('')
  const [inputMint, outputMint] = [
    isValidPublicKey(propInputMint) ? solToWSol(propInputMint).toBase58() : propInputMint,
    isValidPublicKey(propOutputMint) ? solToWSol(propOutputMint).toBase58() : propOutputMint
  ]

  const [txVersion, urlConfigs] = useAppStore((s) => [s.txVersion, s.urlConfigs], shallow)
  const slippage = useSwapStore((s) => s.slippage)
  const slippageBps = new Decimal(propsSlippage || slippage * 10000).toFixed(0)

  const disabled = useMemo(() => {
    return !inputMint || !outputMint || new Decimal(amount.trim() || 0).isZero() || inputMint === outputMint
  }, [inputMint, outputMint, amount])
  const requestBody: QuoteRequest = useMemo(() => {
    return {
      inputMint,
      outputMint,
      amount: new Decimal(amount.trim() || 0).toFixed(0),
      slippageBps: Number(slippageBps),
      swapType
    }
  }, [inputMint, outputMint, amount, slippageBps, swapType])

  const updateAmount = useCallback(
    debounce((val: string) => {
      setAmount(val)
    }, 200),
    []
  )

  useEffect(() => {
    updateAmount(propsAmount)
  }, [propsAmount, updateAmount])

  const { data, error, ...swrProps } = useSWR(() => (disabled ? null : `${quoteApi}/api/quote`), fetcher(requestBody), {
    refreshInterval,
    focusThrottleInterval: refreshInterval,
    dedupingInterval: 30 * 1000
  })

  return {
    response: error || !data?.success ? undefined : data,
    data: error || !data?.success ? undefined : data,
    error: error?.message,
    // openTime: data?.openTime,
    ...swrProps
  }
}
