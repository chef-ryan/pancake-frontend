import { useCallback, useEffect, useState } from 'react'
import BN from 'bn.js'
import { UnifiedCurrency, UnifiedCurrencyAmount, UnifiedToken } from '@pancakeswap/swap-sdk-core'
import { PoolUtils } from '@pancakeswap/solana-core-sdk'
import tryParseAmount from '@pancakeswap/utils/tryParseAmount'
import { useSolanaEpochInfo } from './useSolanaEpochInfo'

export function useDependentAmountFromClmm(params: {
  independentAmount?: UnifiedCurrencyAmount<UnifiedCurrency>
  token0?: UnifiedToken
  token1?: UnifiedToken
  tickSpacing?: number
  price?: string
  tickLower?: number
  tickUpper?: number
  outOfRange: boolean
  invalidRange: boolean
  dependentCurrency?: UnifiedCurrency
}) {
  const {
    independentAmount,
    token0,
    token1,
    tickSpacing,
    price,
    tickLower,
    tickUpper,
    outOfRange,
    invalidRange,
    dependentCurrency,
  } = params

  const epochInfo = useSolanaEpochInfo()
  const [dependentAmount, setDependentAmount] = useState<UnifiedCurrencyAmount<UnifiedCurrency> | undefined>(undefined)

  const computePairAmount = useCallback(async () => {
    try {
      setDependentAmount(undefined)
      if (!epochInfo) return
      if (!independentAmount || !token0 || !token1 || !tickSpacing || !price) return
      if (typeof tickLower !== 'number' || typeof tickUpper !== 'number') return
      if (outOfRange || invalidRange) return
      if (!dependentCurrency) return

      const poolInfo: any = {
        price: parseFloat(price),
        mintA: { address: token0.address, decimals: token0.decimals, extensions: {} },
        mintB: { address: token1.address, decimals: token1.decimals, extensions: {} },
        config: {
          tickSpacing,
          id: '0',
          protocolFeeRate: 0,
          tradeFeeRate: 0,
          fundFeeRate: 0,
          defaultRange: 0,
          defaultRangePoint: [],
        },
        programId: 'Clmm',
        id: 'ClmmPool',
      }

      const wrappedIndependentAmount = independentAmount?.wrapped
      const inputA = wrappedIndependentAmount?.currency?.equals?.(token0)
      const amountBN = new BN(independentAmount.quotient.toString())

      const res = await PoolUtils.getLiquidityAmountOutFromAmountIn({
        poolInfo,
        inputA: Boolean(inputA),
        tickLower: Math.min(tickLower, tickUpper),
        tickUpper: Math.max(tickLower, tickUpper),
        amount: amountBN,
        slippage: 0,
        add: true,
        epochInfo,
        amountHasFee: true,
      })

      const rawOut = inputA ? res.amountB.amount : res.amountA.amount
      setDependentAmount(
        tryParseAmount(rawOut.div(new BN(10 ** dependentCurrency.decimals)).toString(), dependentCurrency),
      )
    } catch {
      setDependentAmount(undefined)
    }
  }, [
    epochInfo,
    independentAmount,
    token0,
    token1,
    tickSpacing,
    price,
    tickLower,
    tickUpper,
    outOfRange,
    invalidRange,
    dependentCurrency,
  ])

  useEffect(() => {
    computePairAmount()
  }, [computePairAmount, independentAmount, epochInfo])

  return dependentAmount
}
