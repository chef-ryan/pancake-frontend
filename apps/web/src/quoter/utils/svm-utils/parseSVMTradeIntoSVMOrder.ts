import { type SVMOrder, OrderType, SVMTrade } from '@pancakeswap/price-api-sdk'
import { PoolType, Route, RouteType, SVMPool } from '@pancakeswap/smart-router'
import { SolRouterTrade } from '@pancakeswap/solana-router-sdk'
import {
  Currency,
  CurrencyAmount,
  Percent,
  TradeType,
  UnifiedCurrencyAmount,
  SPLToken,
} from '@pancakeswap/swap-sdk-core'
import { SOLANA_NATIVE_TOKEN_ADDRESS } from 'quoter/consts'
import { SVMQuoteQuery } from 'quoter/quoter.types'

export function parseRoutePlansToRoutes(svmTrade: SolRouterTrade): Route[] {
  const routes: Route[] = []
  let currentGroup: typeof svmTrade.routes = []

  for (let i = 0; i < svmTrade.routes.length; i++) {
    const routerPlan = svmTrade.routes[i]
    currentGroup.push(routerPlan)

    // Check if this RouterPlan's outputMint matches the final outputAmount address
    // or if this is the last plan in the array
    const isEndOfRoute =
      routerPlan.swapInfo.outputMint === svmTrade.outputAmount.currency.wrapped.address ||
      i === svmTrade.routes.length - 1

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

      // Build path: start with input currency, include all intermediate currencies, end with output currency
      // For multi-hop routes, path will be [inputCurrency, intermediate1, intermediate2, ..., outputCurrency]
      const path: Currency[] = []

      // Add the input currency (from the first plan)
      const firstPlan = currentGroup[0]
      path.push(svmTrade.inputAmount.currency as Currency)

      // Add intermediate currencies (outputMint of each plan except the last one becomes an intermediate currency)
      for (let j = 0; j < currentGroup.length - 1; j++) {
        const plan = currentGroup[j]
        const outputMintAddress = plan.swapInfo.outputMint

        // Find the currency for this outputMint
        let intermediateCurrency: SPLToken
        if (outputMintAddress === svmTrade.inputAmount.currency.wrapped.address) {
          intermediateCurrency = svmTrade.inputAmount.currency
        } else if (outputMintAddress === svmTrade.outputAmount.currency.wrapped.address) {
          intermediateCurrency = svmTrade.outputAmount.currency
        } else {
          // For intermediate tokens that don't match input/output currencies,
          // create a proper SPLToken instance
          intermediateCurrency = new SPLToken({
            address: outputMintAddress,
            // NOTE: this is only for mock data so intermediateCurrency can be passed around without any problem
            // before using path, we need to use useUnifiedCurrency to get actual token info.
            chainId: svmTrade.inputAmount.currency.chainId,
            programId: svmTrade.inputAmount.currency.programId,
            decimals: svmTrade.inputAmount.currency.decimals,
            symbol: svmTrade.inputAmount.currency.symbol,
            name: svmTrade.inputAmount.currency.name,
            logoURI: '',
          })
        }

        // NOTE: cast to Currency to avoid type error
        // Fix it later
        path.push(intermediateCurrency as Currency)
      }

      // Add the final output currency
      path.push(svmTrade.outputAmount.currency as Currency)

      // Use amounts from first and last plans in the group
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

  return routes
}

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
  const routes: Route[] = parseRoutePlansToRoutes(svmTrade)

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
