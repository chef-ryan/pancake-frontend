import { Pool, PoolType, SmartRouter } from '@pancakeswap/smart-router'
import { Currency, TradeType } from '@pancakeswap/swap-sdk-core'
import { currencyUSDPriceAtom } from 'hooks/useCurrencyUsdPrice'
import { nativeCurrencyAtom } from 'hooks/useNativeCurrency'
import { TokenFee } from 'hooks/useTokenFee'
import { globalWorkerAtom } from 'hooks/useWorker'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { createQuoteProvider } from '../createQuoteProvider'
import { NoValidRouteError, QuoteOption } from '../quoter.types'
import { multicallGasLimitAtom } from '../useMulticallGasLimit'
import { gasPriceWeiAtom } from './gasPriceAtom'
import { isEqualQuoteQuery } from './PoolHashHelper'
import { commonPoolsLiteAtom } from './poolsAtom'
import { quoteRevalidateAtom } from './revalidateAtom'

export const bestAMMTradeFromQuoterWorkerAtom = atomFamily((option: QuoteOption) => {
  const { amount, currency, tradeType, maxSplits, baseCurrency } = option
  return atom(async (get) => {
    console.log('[quote] call quoter', option)
    get(quoteRevalidateAtom(option))
    const gasLimit = await get(multicallGasLimitAtom(currency?.chainId))
    if (!amount || !amount.currency || !currency) {
      return undefined
    }
    const quoteProvider = createQuoteProvider({
      gasLimit,
    })
    const worker = get(globalWorkerAtom)

    if (!worker) {
      throw new Error('Quote worker not initialized')
    }

    try {
      const candidatePools = await get(
        commonPoolsLiteAtom({
          currencyA: amount.currency,
          currencyB: currency,
          chainId: currency.chainId,
        }),
      )

      // const tokenInFee = await get(tokenFeeAtom(amount.currency))
      // const tokenOutFee = await get(tokenFeeAtom(currency))
      // const filtered = filterPools(candidatePools, baseCurrency || undefined, currency, tokenInFee, tokenOutFee)
      const filtered = candidatePools

      const quoteCurrencyUsdPrice = await get(currencyUSDPriceAtom(currency))
      const nativeCurrency = get(nativeCurrencyAtom(currency.chainId))
      const nativeCurrencyUsdPrice = await get(currencyUSDPriceAtom(nativeCurrency))

      const gasPriceWei = await get(gasPriceWeiAtom(currency?.chainId))
      const quoterConfig = (quoteProvider as ReturnType<typeof SmartRouter.createQuoteProvider>)?.getConfig?.()
      const result = await worker.getBestTrade({
        chainId: currency.chainId,
        currency: SmartRouter.Transformer.serializeCurrency(currency),
        tradeType: tradeType || TradeType.EXACT_INPUT,
        amount: {
          currency: SmartRouter.Transformer.serializeCurrency(amount.currency),
          value: amount.quotient.toString(),
        },
        gasPriceWei: typeof gasPriceWei !== 'function' ? gasPriceWei?.toString() : undefined,
        maxHops: 3,
        maxSplits,
        poolTypes: getAllowedPoolTypes(option),
        candidatePools: filtered.map(SmartRouter.Transformer.serializePool),
        onChainQuoterGasLimit: quoterConfig?.gasLimit?.toString(),
        quoteCurrencyUsdPrice,
        nativeCurrencyUsdPrice,
      })
      const parsed = SmartRouter.Transformer.parseTrade(currency.chainId, result as any)
      console.log('[quote] parsed', parsed)
      return parsed
    } catch (ex) {
      console.warn(`[quote]`, ex)
      throw new NoValidRouteError()
    }
  })
}, isEqualQuoteQuery)

function getAllowedPoolTypes(options: QuoteOption) {
  const { infinitySwap, v2Swap, v3Swap, stableSwap } = options
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
}

function filterPools(
  pools: Pool[],
  baseCurrency?: Currency,
  currency?: Currency,
  tokenInFee?: TokenFee,
  tokenOutFee?: TokenFee,
) {
  if (tokenInFee && tokenInFee.sellFeeBps > 0n) {
    return pools?.filter(
      (pool) =>
        !(
          pool.type === PoolType.V3 &&
          baseCurrency &&
          (pool.token0.equals(baseCurrency) || pool.token1.equals(baseCurrency))
        ),
    )
  }
  if (tokenOutFee && tokenOutFee.buyFeeBps > 0n) {
    return pools?.filter(
      (pool) =>
        !(pool.type === PoolType.V3 && currency && (pool.token0.equals(currency) || pool.token1.equals(currency))),
    )
  }

  return pools
}
