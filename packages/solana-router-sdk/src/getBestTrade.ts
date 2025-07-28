import { SOLMint, SPLToken, TradeType, UnifiedCurrencyAmount, WSOLMint } from '@pancakeswap/sdk'
import { PublicKey } from '@solana/web3.js'
import { create } from 'superstruct'
import { FormattedUltraQuoteResponse } from './FormattedUltraQuoteResponse'
import { ultraSwapService } from './UltraSwapService'

interface SolanaQuoteRequest {
  inputMint: string
  outputMint: string
  amount: string
  slippageBps: number
  swapType: 'exactIn' | 'exactOut'
  taker?: string
  excludeRouters?: string
  excludeDexes?: string
}

interface BestSolanaTradeParams {
  inputCurrency: SPLToken
  outputCurrency: SPLToken
  amount: UnifiedCurrencyAmount<SPLToken>
  account?: string
  slippageBps?: number
  tradeType: TradeType
  excludeRouters?: string
  excludeDexes?: string
}

interface RouterPlan {
  swapInfo: {
    inputMint: string
    inAmount: string
    outputMint: string
    outAmount: string
    ammKey: PublicKey
    label: string
    feeAmount: string
    feeMint: PublicKey
  }
  // 10000 = 0.01%, 15000 = 0.15%
  bps?: number
  percent: number
}

export interface SolRouterTrade {
  tradeType: TradeType
  inputAmount: UnifiedCurrencyAmount<SPLToken>
  outputAmount: UnifiedCurrencyAmount<SPLToken>
  routes: RouterPlan[]
  requestId: string
  otherAmountThreshold: string
  priceImpactPct: string
  slippageBps: number
  transaction: string | null
}

export const solToWSol = (key: string): string => (key === SOLMint.toBase58() ? WSOLMint.toBase58() : key)

export const getBestSolanaTrade = async ({
  inputCurrency,
  outputCurrency,
  tradeType,
  amount,
  account,
  slippageBps = 50,
}: BestSolanaTradeParams): Promise<SolRouterTrade> => {
  const inputMint = solToWSol(inputCurrency.address)
  const outputMint = solToWSol(outputCurrency.address)
  const swapType = tradeType === TradeType.EXACT_INPUT ? 'exactIn' : 'exactOut'

  const requestBody: SolanaQuoteRequest = {
    inputMint,
    outputMint,
    amount: amount.quotient.toString(),
    slippageBps,
    swapType,
    taker: account,
  }

  const response = await ultraSwapService.getQuote(requestBody)
  const quoteResponse = create(response, FormattedUltraQuoteResponse, 'conver FormattedUltraQuoteResponse Error')

  // Convert Solana quote format to SmartRouter trade format
  return {
    tradeType,
    inputAmount: UnifiedCurrencyAmount.fromRawAmount(inputCurrency, quoteResponse.inAmount),
    outputAmount: UnifiedCurrencyAmount.fromRawAmount(outputCurrency, quoteResponse.outAmount),
    routes: quoteResponse.routePlan,
    requestId: quoteResponse.requestId,
    otherAmountThreshold: quoteResponse.otherAmountThreshold,
    priceImpactPct: quoteResponse.priceImpactPct,
    slippageBps: quoteResponse.slippageBps,
    transaction: quoteResponse.transaction,
  }
}
