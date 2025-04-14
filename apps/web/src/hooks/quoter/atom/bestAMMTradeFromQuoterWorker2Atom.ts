import { ChainId } from '@pancakeswap/chains'
import { BATCH_MULTICALL_CONFIGS, SmartRouter } from '@pancakeswap/smart-router'
import { TradeType } from '@pancakeswap/swap-sdk-core'
import { currencyUSDPriceAtom } from 'hooks/useCurrencyUsdPrice'
import { nativeCurrencyAtom } from 'hooks/useNativeCurrency'
import { globalWorkerAtom } from 'hooks/useWorker'
import { atom } from 'jotai'
import { atomFamily } from 'jotai/utils'
import { createViemPublicClientGetter } from 'utils/viem'
import { CreateQuoteProviderParams, NoValidRouteError, QuoteOption } from '../quoter.types'
import { multicallGasLimitAtom } from '../useMulticallGasLimit'
import { filterPools } from './filterPoolsV3'
import { gasPriceWeiAtom } from './gasPriceAtom'
import { getAllowedPoolTypes } from './getAllowedPoolTypes'
import { isEqualQuoteQuery } from './PoolHashHelper'
import { commonPoolsLiteAtom } from './poolsAtom'
import { quoteRevalidateAtom } from './revalidateAtom'

export const bestAMMTradeFromQuoterWorker2Atom = atomFamily((option: QuoteOption) => {
  const { amount, currency, tradeType, maxSplits } = option
  return atom(async (get) => {
    get(quoteRevalidateAtom(option))
    const gasLimit = await get(multicallGasLimitAtom(currency?.chainId))
    if (!amount || !amount.currency || !currency) {
      return undefined
    }
    const quoteProvider = createQuoteProvider2({
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
          infinity: option.infinitySwap,
        }),
      )

      const filtered = filterPools(candidatePools)

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
        maxHops: option.maxHops,
        maxSplits,
        poolTypes: getAllowedPoolTypes(option),
        candidatePools: filtered.map(SmartRouter.Transformer.serializePool),
        onChainQuoterGasLimit: quoterConfig?.gasLimit?.toString(),
        quoteCurrencyUsdPrice,
        nativeCurrencyUsdPrice,
      })
      const parsed = SmartRouter.Transformer.parseTrade(currency.chainId, result as any)
      return parsed
    } catch (ex) {
      console.warn(`[quote]`, ex)
      throw new NoValidRouteError()
    }
  })
}, isEqualQuoteQuery)

function createQuoteProvider2({ gasLimit, signal }: CreateQuoteProviderParams) {
  const onChainProvider = createViemPublicClientGetter({ transportSignal: signal })
  return SmartRouter.createQuoteProvider({
    onChainProvider,
    gasLimit,
    multicallConfigs: {
      ...BATCH_MULTICALL_CONFIGS,
      [ChainId.BSC]: {
        ...BATCH_MULTICALL_CONFIGS[ChainId.BSC],
        defaultConfig: {
          gasLimitPerCall: 1_000_000,
        },
      },
    },
  })
}
