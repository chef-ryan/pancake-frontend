import { getBestSolanaTrade } from '@pancakeswap/solana-router-sdk'
import { SPLToken, TradeType, UnifiedCurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { Loadable } from '@pancakeswap/utils/Loadable'
import { withTimeout } from '@pancakeswap/utils/withTimeout'
import { atomFamily } from 'jotai/utils'
import { QUOTE_TIMEOUT } from 'quoter/consts'
import { parseSVMTradeIntoSVMOrder } from 'quoter/utils/svm-utils/parseSVMTradeIntoSVMOrder'
import { type InterfaceOrder } from 'views/Swap/utils'
import type { QuoteQuery } from '../quoter.types'
import { atomWithLoadable } from './atomWithLoadable'

export const bestSVMOrderAtom = atomFamily(
  (_option: QuoteQuery) => {
    return atomWithLoadable(async () => {
      const { baseCurrency, currency, amount, tradeType, slippage } = _option

      // Early validation
      if (!baseCurrency || !currency || !amount || tradeType === undefined) {
        return Loadable.Nothing<InterfaceOrder>()
      }

      const controller = new AbortController()
      // const perf = get(quoteTraceAtom(_option))
      // perf.tracker.track('start')

      try {
        const query = withTimeout(
          async () => {
            // Parse response to SVM order format
            const solTradeRoute = await getBestSolanaTrade({
              // TODO: need to remove as SPLToken
              inputCurrency: baseCurrency as SPLToken,
              outputCurrency: currency as SPLToken,
              amount: amount as UnifiedCurrencyAmount<SPLToken>,
              tradeType: tradeType as TradeType,
              slippageBps: slippage,
            })

            //   perf.tracker.success(svmOrder)
            return solTradeRoute
          },
          {
            ms: QUOTE_TIMEOUT,
            abort: () => {
              controller.abort()
            },
          },
        )

        let bestOrder: InterfaceOrder | undefined

        const trade = await query()

        // if result.type is SVMOrder, can safely cast to InterfaceOrder
        if (trade) {
          bestOrder = parseSVMTradeIntoSVMOrder(trade, _option)
        }

        if (!bestOrder) {
          return Loadable.Nothing<InterfaceOrder>()
        }

        console.log('bestOrder', bestOrder)

        return Loadable.Just<InterfaceOrder>(bestOrder)
      } catch (error) {
        console.log('error', error)

        return Loadable.Fail<InterfaceOrder>(error)
        //   perf.tracker.fail(error)
      } finally {
        //   perf.tracker.report()
      }
    })
  },
  (a, b) =>
    a.baseCurrency?.wrapped?.address === b.baseCurrency?.wrapped?.address &&
    a.currency?.wrapped?.address === b.currency?.wrapped?.address &&
    a.amount?.toExact() === b.amount?.toExact() &&
    a.tradeType === b.tradeType,
)
