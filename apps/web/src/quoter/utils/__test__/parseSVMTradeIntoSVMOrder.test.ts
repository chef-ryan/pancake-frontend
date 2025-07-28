import { OrderType } from '@pancakeswap/price-api-sdk'
import { PoolType, SVMPool } from '@pancakeswap/smart-router'
import type { SolRouterTrade } from '@pancakeswap/solana-router-sdk'
import { SPLToken, TradeType, UnifiedCurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { PublicKey } from '@solana/web3.js'
import type { QuoteQuery } from '../../quoter.types'
import { parseSVMTradeIntoSVMOrder } from '../svm-utils/parseSVMTradeIntoSVMOrder'

// Mock tokens
const MOCK_SOL = new SPLToken({
  chainId: 103,
  programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  address: 'So11111111111111111111111111111111111111112', // WSOL
  decimals: 9,
  symbol: 'SOL',
  name: 'Solana',
  logoURI: 'https://example.com/sol.png',
})

const MOCK_USDC = new SPLToken({
  chainId: 103,
  programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
  decimals: 6,
  symbol: 'USDC',
  name: 'USD Coin',
  logoURI: 'https://example.com/usdc.png',
})

describe('parseSVMTradeIntoSVMOrder', () => {
  it('should convert SolRouterTrade to SVMOrder correctly', () => {
    // Mock SolRouterTrade
    const mockSolRouterTrade: SolRouterTrade = {
      tradeType: TradeType.EXACT_INPUT,
      inputAmount: UnifiedCurrencyAmount.fromRawAmount(MOCK_SOL, '1000000000'), // 1 SOL
      outputAmount: UnifiedCurrencyAmount.fromRawAmount(MOCK_USDC, '100000000'), // 100 USDC
      routes: [
        {
          swapInfo: {
            inputMint: MOCK_SOL.address,
            inAmount: '1000000000',
            outputMint: MOCK_USDC.address,
            outAmount: '100000000',
            ammKey: new PublicKey('11111111111111111111111111111112'),
            label: 'Raydium',
            feeAmount: '5000000', // 0.005 SOL
            feeMint: new PublicKey(MOCK_SOL.address),
          },
          bps: 25, // 0.25%
          percent: 100,
        },
      ],
      otherAmountThreshold: '99000000', // 99 USDC minimum out
      priceImpactPct: '0.0002', // 0.15%
      slippageBps: 50,
      transaction: 'mock_transaction_string',
    }

    // Mock QuoteQuery
    const mockQuoteQuery: QuoteQuery = {
      tradeType: TradeType.EXACT_INPUT,
      speedQuoteEnabled: false,
      xEnabled: false,
      blockNumber: 123456,
      createTime: Date.now(),
      infinitySwap: false,
      hash: 'mock_query_hash',
    }

    // Execute function
    const result = parseSVMTradeIntoSVMOrder(mockSolRouterTrade, mockQuoteQuery)

    // Assertions
    expect(result.type).toBe(OrderType.PCS_SVM)
    expect(result.trade).toBeDefined()

    // Test trade properties
    const { trade } = result
    expect(trade.tradeType).toBe(TradeType.EXACT_INPUT)
    expect(trade.inputAmount).toEqual(mockSolRouterTrade.inputAmount)
    expect(trade.outputAmount).toEqual(mockSolRouterTrade.outputAmount)
    expect(trade.quoteQueryHash).toBe('mock_query_hash')
    expect(trade.transaction).toBe('mock_transaction_string')

    // Test routes conversion
    expect(trade.routes).toHaveLength(1)
    const route = trade.routes[0]
    expect(route.pools).toHaveLength(1)

    // Cast to SVMPool to access SVM-specific properties
    const svmPool = route.pools[0] as SVMPool
    expect(svmPool.type).toBe(PoolType.SVM)
    expect(svmPool.id).toBe('11111111111111111111111111111112')
    expect(svmPool.fee).toBe(25)

    expect(route.path).toHaveLength(2)
    expect(route.path[0]).toBe(MOCK_SOL)
    expect(route.path[1]).toBe(MOCK_USDC)
    expect(route.percent).toBe(100)

    // Test price impact calculation (negative price impact converts to 0)
    expect(trade.priceImpactPct.toSignificant(3)).toBe('0.02')

    // Test threshold amounts with null checks
    if (trade.minimumAmountOut) {
      expect(trade.minimumAmountOut.toExact()).toBe('99') // 99 USDC (6 decimals)
    }
    if (trade.maximumAmountIn) {
      expect(trade.maximumAmountIn.toExact()).toBe('0.099') // 0.099 SOL (9 decimals)
    }
  })
})
