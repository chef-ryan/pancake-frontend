import { type SVMOrder, OrderType, SVMTrade } from '@pancakeswap/price-api-sdk'
import { PoolType, Route, RouteType, SVMPool } from '@pancakeswap/smart-router'
import { SolRouterTrade } from '@pancakeswap/solana-router-sdk'
import { Currency, CurrencyAmount, Percent, TradeType, UnifiedCurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { QuoteQuery, SVMQuoteQuery } from 'quoter/quoter.types'

/**
 * SVM Trade to SVM Order mapping
 * SolRouterTrade → SVMOrder
 * ├── tradeType (from query.tradeType)
 * ├── inputAmount ✓ (direct copy)
 * ├── outputAmount ✓ (direct copy)
 * ├── routes: RouterPlan[] → Route[] (convert each RouterPlan with grouping)
 * |───────|Group RouterPlans until outputMint matches final outputAmount address
 * |───────|RouterPlan.swapInfo.ammKey → SVMPool.id
 * |───────|RouterPlan.swapInfo.feeAmount → SVMPool.feeAmount
 * |───────|RouterPlan.percent → Route.percent (from first plan in group)
 * |───────|RouterPlan.swapInfo.inAmount → Route.inputAmount (from first plan)
 * |───────|RouterPlan.swapInfo.outAmount → Route.outputAmount (from last plan)
 * ├── priceImpactPct → priceImpactPct ✓ (direct copy)
 * ├── transaction ✓ (direct copy)
 * ├── maximumAmountIn → maximumAmountIn ✓ (direct copy)
 * ├── minimumAmountOut → minimumAmountOut ✓ (direct copy)
 * └── + quoteQueryHash (from query.hash)
 */
export function parseSVMTradeIntoSVMOrder(svmTrade: SolRouterTrade, query: SVMQuoteQuery): SVMOrder<TradeType> {
  // Convert RouterPlan[] to Route[] with grouping logic
  const routes: Route[] = []
  let currentGroup: typeof svmTrade.routes = []

  for (let i = 0; i < svmTrade.routes.length; i++) {
    const routerPlan = svmTrade.routes[i]
    currentGroup.push(routerPlan)

    // Check if this RouterPlan's outputMint matches the final outputAmount address
    // or if this is the last plan in the array
    const isEndOfRoute =
      routerPlan.swapInfo.outputMint === svmTrade.outputAmount.currency.address || i === svmTrade.routes.length - 1

    if (isEndOfRoute) {
      // Process the current group into a single Route
      const pools = currentGroup.map((plan) => {
        const feeAmount = UnifiedCurrencyAmount.fromRawAmount(svmTrade.inputAmount.currency, plan.swapInfo.feeAmount)

        const pool: SVMPool = {
          type: PoolType.SVM,
          id: plan.swapInfo.ammKey.toString(),
          fee: plan.bps,
          feeAmount,
        }

        return pool
      })

      // Build path: start with input currency, end with output currency
      // For multi-hop routes, we use the start and end currencies
      // (intermediate tokens would require additional token resolution)
      const path = [svmTrade.inputAmount.currency as Currency, svmTrade.outputAmount.currency as Currency]

      // Use amounts from first and last plans in the group
      const firstPlan = currentGroup[0]
      const lastPlan = currentGroup[currentGroup.length - 1]

      const inputAmount = UnifiedCurrencyAmount.fromRawAmount(
        svmTrade.inputAmount.currency as Currency,
        firstPlan.swapInfo.inAmount,
      )
      const outputAmount = UnifiedCurrencyAmount.fromRawAmount(
        svmTrade.outputAmount.currency as Currency,
        lastPlan.swapInfo.outAmount,
      )

      routes.push({
        type: RouteType.SVM,
        pools,
        path,
        // NOTE: it's dangerous to cast UnifiedCurrencyAmount to CurrencyAmount
        // but can't add UnifiedCurrencyAmount to Route[] becuase it's only for EVM
        // Need to find a better way to handle this
        inputAmount: inputAmount as CurrencyAmount<Currency>,
        outputAmount: outputAmount as CurrencyAmount<Currency>,
        percent: firstPlan.percent, // Use percent from first plan in group
      })

      // Reset for next group
      currentGroup = []
    }
  }

  const PCT_MULTIPLIER = 1_000_000

  // Truncate decimal part (e.g. 123.232 -> 123)
  const priceNumber = Math.trunc(Number(svmTrade.priceImpactPct) * PCT_MULTIPLIER)

  // Create SVMTrade
  const svmTradeData: SVMTrade<TradeType> = {
    tradeType: query.tradeType || svmTrade.tradeType,
    inputAmount: svmTrade.inputAmount,
    outputAmount: svmTrade.outputAmount,
    priceImpactPct: priceNumber > 0 ? new Percent(priceNumber, PCT_MULTIPLIER) : new Percent(0, PCT_MULTIPLIER / 100),
    routes,
    requestId: svmTrade.requestId,
    quoteQueryHash: query.hash,
    transaction: svmTrade.transaction,
    maximumAmountIn: UnifiedCurrencyAmount.fromRawAmount(svmTrade.inputAmount.currency, svmTrade.otherAmountThreshold),
    minimumAmountOut: UnifiedCurrencyAmount.fromRawAmount(
      svmTrade.outputAmount.currency,
      svmTrade.otherAmountThreshold,
    ),
  }

  // Create SVMOrder
  return {
    type: OrderType.PCS_SVM,
    trade: svmTradeData,
  }
}
