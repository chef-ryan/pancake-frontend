import { useDebounce, usePropsChanged } from '@pancakeswap/hooks'
import { PoolType, Route, SmartRouter, SmartRouterTrade } from '@pancakeswap/smart-router'
import { BigintIsh, CurrencyAmount, TradeType } from '@pancakeswap/swap-sdk-core'
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import { POOLS_NORMAL_REVALIDATE } from 'config/pools'
import { useCurrencyUsdPrice } from 'hooks/useCurrencyUsdPrice'
import useNativeCurrency from 'hooks/useNativeCurrency'
import { useTokenFee } from 'hooks/useTokenFee'
import { useCallback, useDeferredValue, useEffect, useMemo, useRef } from 'react'
import { useCurrentBlock } from 'state/block/hooks'
import { useFeeDataWithGasPrice } from 'state/user/hooks'
import { tracker } from 'utils/datadog'
import { publicClient } from 'utils/viem'
import { FactoryOptions, Options } from './quoter.types'
import { useMulticallGasLimit } from './useMulticallGasLimit'

export function bestTradeHookFactory<
  T extends Pick<
    SmartRouterTrade<TradeType>,
    'inputAmount' | 'outputAmount' | 'tradeType' | 'inputAmountWithGasAdjusted' | 'outputAmountWithGasAdjusted'
  > & {
    routes: Pick<Route, 'path' | 'pools' | 'inputAmount' | 'outputAmount'>[]
    blockNumber?: BigintIsh
  },
>({
  key,
  useCommonPools,
  createQuoteProvider: createCustomQuoteProvider,
  quoterOptimization = true,
  useGetBestTrade,
}: FactoryOptions<T>) {
  return function useBestTrade({
    amount,
    baseCurrency,
    currency,
    tradeType = TradeType.EXACT_INPUT,
    maxHops,
    maxSplits,
    v2Swap = true,
    v3Swap = true,
    infinitySwap = true,
    stableSwap = true,
    enabled = true,
    autoRevalidate,
    trackPerf,
  }: Options) {
    const getBestTrade = useGetBestTrade()
    const { gasPrice } = useFeeDataWithGasPrice()
    const gasLimit = useMulticallGasLimit(currency?.chainId)
    const currenciesUpdated = usePropsChanged(baseCurrency, currency)
    const queryClient = useQueryClient()

    const keepPreviousDataRef = useRef<boolean>(true)

    if (currenciesUpdated) {
      keepPreviousDataRef.current = false
    }

    const blockNumber = useCurrentBlock()
    const {
      refresh: refreshPools,
      pools: candidatePools,
      loading,
      syncing,
    } = useCommonPools(baseCurrency || amount?.currency, currency ?? undefined, {
      blockNumber,
      allowInconsistentBlock: true,
      enabled,
    })

    const tokenInFee = useTokenFee(baseCurrency && baseCurrency.isToken ? baseCurrency : undefined)
    const tokenOutFee = useTokenFee(currency && currency.isToken ? currency : undefined)

    const candidatePoolsWithoutV3WithFot = useMemo(() => {
      let pools = candidatePools
      if (tokenInFee && tokenInFee.sellFeeBps > 0n) {
        pools = pools?.filter(
          (pool) =>
            !(
              pool.type === PoolType.V3 &&
              baseCurrency &&
              (pool.token0.equals(baseCurrency) || pool.token1.equals(baseCurrency))
            ),
        )
      }
      if (tokenOutFee && tokenOutFee.buyFeeBps > 0n) {
        pools = pools?.filter(
          (pool) =>
            !(pool.type === PoolType.V3 && currency && (pool.token0.equals(currency) || pool.token1.equals(currency))),
        )
      }

      return pools
    }, [candidatePools, tokenInFee, tokenOutFee, baseCurrency, currency])

    const poolProvider = useMemo(
      () => SmartRouter.createStaticPoolProvider(candidatePoolsWithoutV3WithFot),
      [candidatePoolsWithoutV3WithFot],
    )
    const deferQuotientRaw = useDeferredValue(amount?.quotient?.toString())
    const deferQuotient = useDebounce(deferQuotientRaw, 500)
    const { data: quoteCurrencyUsdPrice } = useCurrencyUsdPrice(currency ?? undefined)
    const currencyNativeChain = useNativeCurrency(currency?.chainId)
    const { data: nativeCurrencyUsdPrice } = useCurrencyUsdPrice(currencyNativeChain)

    const poolTypes = useMemo(() => {
      const types: PoolType[] = []
      if (infinitySwap) {
        types.push(PoolType.InfinityBIN)
        types.push(PoolType.InfinityCL)
      }
      if (v2Swap) {
        types.push(PoolType.V2)
      }
      if (v3Swap) {
        types.push(PoolType.V3)
      }
      if (stableSwap) {
        types.push(PoolType.STABLE)
      }
      return types
    }, [v2Swap, v3Swap, stableSwap, infinitySwap])

    const {
      data: trade,
      status,
      fetchStatus,
      isPlaceholderData,
      error,
      refetch,
    } = useQuery<T | undefined>({
      queryKey: [
        key,
        currency?.chainId,
        amount?.currency?.symbol,
        currency?.symbol,
        tradeType,
        deferQuotient,
        maxHops,
        maxSplits,
        poolTypes,
      ],
      queryFn: async ({ signal }) => {
        if (!amount || !amount.currency || !currency || !deferQuotient) {
          return undefined
        }
        const quoteProvider = createCustomQuoteProvider({
          gasLimit,
          signal,
        })

        const deferAmount = CurrencyAmount.fromRawAmount(amount.currency, deferQuotient)
        const label = `[BEST_AMM](${key}) chain ${currency.chainId}, ${deferAmount.toExact()} ${
          amount.currency.symbol
        } -> ${currency.symbol}, tradeType ${tradeType}`
        const startTime = performance.now()
        SmartRouter.logger.log(label)
        SmartRouter.logger.metric(label, candidatePools)
        const res = await getBestTrade(deferAmount, currency, tradeType, {
          gasPriceWei:
            typeof gasPrice === 'bigint'
              ? gasPrice
              : async () => publicClient({ chainId: amount.currency.chainId }).getGasPrice(),
          maxHops,
          poolProvider,
          maxSplits,
          quoteProvider,
          allowedPoolTypes: poolTypes,
          quoterOptimization,
          quoteCurrencyUsdPrice,
          nativeCurrencyUsdPrice,
          signal,
        })
        const duration = Math.floor(performance.now() - startTime)

        if (trackPerf) {
          tracker.log(`[PERF] ${key} duration:${duration}ms`, {
            chainId: currency.chainId,
            label: key,
            duration,
          })
        }

        if (!res) {
          return undefined
        }
        SmartRouter.logger.metric(
          label,
          res.inputAmount.toExact(),
          res.inputAmount.currency.symbol,
          '->',
          res.outputAmount.toExact(),
          res.outputAmount.currency.symbol,
          res.routes,
        )
        SmartRouter.logger.log(label, res)
        const result: T = {
          ...res,
          blockNumber,
        }
        return result
      },
      enabled: !!(amount && currency && candidatePools && !loading && deferQuotient && enabled),
      refetchOnWindowFocus: false,
      placeholderData: keepPreviousDataRef.current ? keepPreviousData : undefined,
      retry: false,
      staleTime: autoRevalidate && amount?.currency.chainId ? POOLS_NORMAL_REVALIDATE[amount.currency.chainId] : 0,
      refetchInterval:
        autoRevalidate && amount?.currency.chainId ? POOLS_NORMAL_REVALIDATE[amount?.currency?.chainId] : 0,
    })

    useEffect(() => {
      if (!keepPreviousDataRef.current && trade) {
        keepPreviousDataRef.current = true
      }
    }, [trade, keepPreviousDataRef])

    const isValidating = fetchStatus === 'fetching'
    const isLoading = status === 'pending' || isPlaceholderData

    const refresh = useCallback(async () => {
      await refreshPools()
      await queryClient.invalidateQueries({
        queryKey: [key],
        refetchType: 'none',
      })
      refetch()
    }, [refreshPools, queryClient, refetch])

    return {
      refresh,
      trade,
      isLoading: isLoading || loading,
      isStale: trade?.blockNumber !== blockNumber,
      error: error as Error | undefined,
      syncing:
        syncing || isValidating || (amount?.quotient?.toString() !== deferQuotient && deferQuotient !== undefined),
    }
  }
}
