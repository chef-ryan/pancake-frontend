import { ClassicOrder, OrderType, XOrder } from '@pancakeswap/price-api-sdk'
import { useCallback, useState } from 'react'

import { usePCSX } from 'hooks/usePCSX'
import { useThrottleFn } from 'hooks/useThrottleFn'
import { InterfaceOrder } from 'views/Swap/utils'

import { useBetterQuote } from './useBetterQuote'
import { useSwapBestOrder } from './useSwapBestOrder'
import { useSwapBestTrade } from './useSwapBestTrade'
import { createLoadedValue, LoadedValue } from './utils/LoadedValue'
import { useCachedValue } from './utils/useCachedValue'

const noop = () => {}
export const useAllTypeBestTrade = () => {
  const [xEnabled] = usePCSX()
  const [isQuotingPaused, setIsQuotingPaused] = useState(false)
  const bestOrder = useSwapBestOrder()
  const tradeOrder = useSwapBestTrade({ maxHops: 3 })

  const currentOrder = useCachedValue(
    () => createLoadedValue(bestOrder.order, bestOrder.isLoading, bestOrder.error),
    isQuotingPaused,
    [bestOrder.order, bestOrder.isLoading, bestOrder.error],
  )

  // const tradeOrder = useCachedValue(() => _tradeOrder, isQuotingPaused, [_tradeOrder])

  const pauseQuoting = useCallback(() => {
    setIsQuotingPaused(true)
  }, [])

  const resumeQuoting = useCallback(() => {
    setIsQuotingPaused(false)
  }, [])

  const refreshTrade: () => void = useThrottleFn(tradeOrder?.refresh || noop, 3000)
  const refreshOrder: () => void = useThrottleFn(bestOrder.refresh, 3000)

  const hasAvailableDutchOrder =
    bestOrder.enabled && bestOrder.order?.type === OrderType.DUTCH_LIMIT && bestOrder.isValidQuote
  const ductedOrder = hasAvailableDutchOrder ? currentOrder : undefined
  const betterQuote: LoadedValue<ClassicOrder | XOrder> = useBetterQuote(tradeOrder, ductedOrder)
  const finalOrder: LoadedValue<ClassicOrder | XOrder> = xEnabled ? betterQuote : tradeOrder
  const tradeLoaded = Boolean(finalOrder && !finalOrder.isLoading)

  return {
    ammOrder: tradeOrder,
    xOrder: currentOrder,
    // TODO: for log purpose in this stage
    betterOrder: betterQuote,
    bestOrder: (tradeLoaded
      ? finalOrder?.trade?.inputAmount && finalOrder?.trade?.outputAmount
        ? finalOrder
        : undefined
      : finalOrder) as InterfaceOrder | undefined,
    tradeLoaded,
    tradeError: finalOrder?.error,
    refreshDisabled:
      finalOrder?.type === OrderType.DUTCH_LIMIT
        ? bestOrder.isLoading || !bestOrder.isStale
        : tradeOrder?.isLoading || tradeOrder?.syncing || !tradeOrder?.isStale,
    refreshOrder: finalOrder?.type === OrderType.DUTCH_LIMIT ? refreshOrder : refreshTrade,
    refreshTrade,
    pauseQuoting,
    resumeQuoting,
  }
}
