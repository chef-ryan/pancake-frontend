import { SmartRouter } from '@pancakeswap/smart-router'
import { useSpeedQuote } from 'hooks/useSpeedQuote'
import { useIsWrapping } from 'hooks/useWrapCallback'
import { useMemo } from 'react'
import { useBestAMMTradeOptions } from './quoter.types'
import { useBestAMMTradeFromOffchainQuoter } from './useBestAMMTradeFromOffchainQuoter'
import { useBestAMMTradeFromQuoterWorker } from './useBestAMMTradeFromQuoterWorker'
import { useBestAMMTradeFromQuoterWorker2 } from './useBestAMMTradeFromQuoterWorker2'
import { getBetterQuote } from './getBetterQuote'

SmartRouter.logger.enable('error,log')

export function useBestAMMTrade({ type = 'quoter', ...params }: useBestAMMTradeOptions) {
  const { amount, baseCurrency, currency, autoRevalidate, enabled = true } = params
  const [speedQuoteEnabled] = useSpeedQuote()
  const isWrapping = useIsWrapping(baseCurrency, currency, amount?.toExact())

  const isQuoterEnabled = useMemo(
    () => Boolean(!isWrapping && (type === 'quoter' || type === 'auto')),
    [type, isWrapping],
  )

  // const isPriceApiEnabled = useExperimentalFeatureEnabled(EXPERIMENTAL_FEATURES.PriceAPI)
  const isQuoterAPIEnabled = useMemo(() => Boolean(!isWrapping && type === 'api'), [isWrapping, type])

  const apiAutoRevalidate = typeof autoRevalidate === 'boolean' ? autoRevalidate : isQuoterAPIEnabled

  // TODO: re-enable after amm endpoint is ready
  // useBestTradeFromApi({
  //   ...params,
  //   enabled: Boolean(enabled && isPriceApiEnabled),
  //   autoRevalidate: apiAutoRevalidate,
  // })

  const bestTradeFromQuoterApi = useBestAMMTradeFromQuoterWorker2({
    ...params,
    enabled: Boolean(enabled && isQuoterAPIEnabled),
    autoRevalidate: apiAutoRevalidate,
  })

  const quoterAutoRevalidate = typeof autoRevalidate === 'boolean' ? autoRevalidate : isQuoterEnabled

  const offchainQuoterEnabled = Boolean(enabled && isQuoterEnabled && !isQuoterAPIEnabled && speedQuoteEnabled)
  const bestTradeFromQuickOnChainQuote = useBestAMMTradeFromQuoterWorker({
    ...params,
    maxHops: 1,
    maxSplits: 0,
    enabled: offchainQuoterEnabled,
    autoRevalidate: quoterAutoRevalidate,
  })
  const bestVerifiedTradeFromOffchainQuoter = useBestAMMTradeFromOffchainQuoter({
    ...params,
    enabled: offchainQuoterEnabled,
    autoRevalidate: quoterAutoRevalidate,
  })

  const bestOffchainWithQuickOnChainQuote = getBetterQuote(
    bestVerifiedTradeFromOffchainQuoter,
    bestTradeFromQuickOnChainQuote,
    { factorGasCost: false },
  )

  const noValidRouteFromOffchainQuoter = Boolean(
    amount &&
      !bestVerifiedTradeFromOffchainQuoter.trade &&
      !bestVerifiedTradeFromOffchainQuoter.isLoading &&
      bestVerifiedTradeFromOffchainQuoter.error,
  )

  const shouldFallbackQuoterOnChain = !speedQuoteEnabled || noValidRouteFromOffchainQuoter
  const bestTradeFromOnChainQuoter = useBestAMMTradeFromQuoterWorker({
    ...params,
    enabled: Boolean(enabled && isQuoterEnabled && !isQuoterAPIEnabled && shouldFallbackQuoterOnChain),
    autoRevalidate: quoterAutoRevalidate,
  })

  const bestTradeFromQuoterWorker = shouldFallbackQuoterOnChain
    ? bestTradeFromOnChainQuoter
    : bestOffchainWithQuickOnChainQuote!

  return useMemo(
    () => (isQuoterAPIEnabled ? bestTradeFromQuoterApi : bestTradeFromQuoterWorker),
    [bestTradeFromQuoterApi, bestTradeFromQuoterWorker, isQuoterAPIEnabled],
  )
}
