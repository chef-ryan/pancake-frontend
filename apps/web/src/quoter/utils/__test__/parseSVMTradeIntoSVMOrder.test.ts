import { OrderType } from '@pancakeswap/price-api-sdk'
import { PoolType, SVMPool } from '@pancakeswap/smart-router'
import type { SolRouterTrade } from '@pancakeswap/solana-router-sdk'
import { SPLToken, TradeType, UnifiedCurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { PublicKey } from '@solana/web3.js'
import type { SVMQuoteQuery } from '../../quoter.types'
import { parseRoutePlansToRoutes, parseSVMTradeIntoSVMOrder } from '../svm-utils/parseSVMTradeIntoSVMOrder'

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

const MOCK_TOKEN_1 = new SPLToken({
  chainId: 103,
  programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // TOKEN_1
  decimals: 6,
  symbol: 'TOKEN_1',
  name: 'Token 1',
  logoURI: 'https://example.com/token1.png',
})

const MOCK_TOKEN_2 = new SPLToken({
  chainId: 103,
  programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
  address: 'cbbtcf3aa214zXHbiAZQwf4122FBYbraNdFqgw4iMij', // TOKEN_2
  decimals: 6,
  symbol: 'TOKEN_2',
  name: 'Token 2',
  logoURI: 'https://example.com/token2.png',
})

describe('parseSVMTradeIntoSVMOrder', () => {
  it('should convert SolRouterTrade to SVMOrder correctly with single-route and single-hop', () => {
    // Mock SolRouterTrade
    const mockSolRouterTrade: SolRouterTrade = {
      requestId: 'mock_request_id',
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
    const mockQuoteQuery: SVMQuoteQuery = {
      baseCurrency: MOCK_SOL,
      currency: MOCK_USDC,
      amount: UnifiedCurrencyAmount.fromRawAmount(MOCK_SOL, '1000000000'),
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

describe('single-route', () => {
  // NOTE: no need to test single-hop only because it's already tested in the main test

  it('should work with multi-hop', () => {
    const mockSolRouterTrade: SolRouterTrade = {
      requestId: 'mock_request_id',
      tradeType: TradeType.EXACT_INPUT,
      otherAmountThreshold: '99000000', // 99 USDC minimum out
      priceImpactPct: '0.0002', // 0.15%
      slippageBps: 50,
      transaction: 'mock_transaction_string',
      inputAmount: UnifiedCurrencyAmount.fromRawAmount(MOCK_SOL, '1000000'),
      outputAmount: UnifiedCurrencyAmount.fromRawAmount(MOCK_USDC, '289245979504'),
      routes: [
        {
          swapInfo: {
            ammKey: new PublicKey('3EjmVndSDMTW9bixbfku8VkwKTtGzKBezMciVa3mHGje'),
            label: 'Whirlpools',
            inputMint: MOCK_SOL.address,
            outputMint: MOCK_TOKEN_1.address,
            inAmount: '1998000',
            outAmount: '292',
            feeAmount: '0',
            feeMint: new PublicKey('So11111111111111111111111111111111111111112'),
          },
          percent: 100,
        },
        {
          swapInfo: {
            ammKey: new PublicKey('4o9kDwyuBhcCF6mmp78HZHPc5Kdw1AmcSwBpcdyQhZvT'),
            label: 'SolFi',
            inputMint: MOCK_TOKEN_1.address,
            outputMint: MOCK_TOKEN_2.address,
            inAmount: '292',
            outAmount: '335847',
            feeAmount: '0',
            feeMint: new PublicKey('cbbtcf3aa214zXHbiAZQwf4122FBYbraNdFqgw4iMij'),
          },
          percent: 100,
        },
        {
          swapInfo: {
            ammKey: new PublicKey('F4i12x6vu71dhHpWBrpRjPYGnNFqH4emVPrsPZydB5c9'),
            label: 'Raydium AMM',
            inputMint: MOCK_USDC.address,
            outputMint: MOCK_USDC.address,
            inAmount: '335847',
            outAmount: '577084538457',
            feeAmount: '0',
            feeMint: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
          },
          percent: 100,
        },
      ],
    }

    const routes = parseRoutePlansToRoutes(mockSolRouterTrade)

    expect(routes).toHaveLength(1)

    const [route1] = routes

    expect(route1.pools).toHaveLength(3)
    expect(route1.percent).toBe(100)

    expect(route1.path.length).toBe(4)
    expect(route1.path[0]).toBe(MOCK_SOL)
    expect(route1.path[1].wrapped.address).toBe(MOCK_TOKEN_1.address)
    expect(route1.path[2].wrapped.address).toBe(MOCK_TOKEN_2.address)
    expect(route1.path[3]).toBe(MOCK_USDC)
  })
})

describe('split-routes', () => {
  it('should work with single-hop only', () => {
    const mockSolRouterTrade: SolRouterTrade = {
      requestId: 'mock_request_id',
      tradeType: TradeType.EXACT_INPUT,
      inputAmount: UnifiedCurrencyAmount.fromRawAmount(MOCK_SOL, '1000000000'), // 1 SOL
      outputAmount: UnifiedCurrencyAmount.fromRawAmount(MOCK_USDC, '100000000'), // 100 USDC
      routes: [
        {
          swapInfo: {
            inputMint: MOCK_SOL.address,
            inAmount: '300000000',
            outputMint: MOCK_USDC.address,
            outAmount: '30000000',
            ammKey: new PublicKey('11111111111111111111111111111112'),
            label: 'Raydium',
            feeAmount: '5000000', // 0.005 SOL
            feeMint: new PublicKey(MOCK_SOL.address),
          },
          bps: 25, // 0.25%
          percent: 30,
        },
        {
          swapInfo: {
            inputMint: MOCK_SOL.address,
            inAmount: '700000000',
            outputMint: MOCK_USDC.address,
            outAmount: '70000000',
            ammKey: new PublicKey('11111111111111111111111111111113'),
            label: 'Raydium',
            feeAmount: '5000000', // 0.005 SOL
            feeMint: new PublicKey(MOCK_SOL.address),
          },
          bps: 25, // 0.25%
          percent: 70,
        },
      ],
      otherAmountThreshold: '99000000', // 99 USDC minimum out
      priceImpactPct: '0.0002', // 0.15%
      slippageBps: 50,
      transaction: 'mock_transaction_string',
    }

    const routes = parseRoutePlansToRoutes(mockSolRouterTrade)

    expect(routes).toHaveLength(2)

    const [route1, route2] = routes

    expect(route1.pools).toHaveLength(1)
    expect(route1.percent).toBe(30)
    expect(route1.path[0]).toBe(MOCK_SOL)
    expect(route1.path[1]).toBe(MOCK_USDC)

    expect(route2.pools).toHaveLength(1)
    expect(route2.percent).toBe(70)
    expect(route2.path[0]).toBe(MOCK_SOL)
    expect(route2.path[1]).toBe(MOCK_USDC)
  })

  it('should work with multi-hop in first', () => {
    const mockSolRouterTrade: SolRouterTrade = {
      requestId: 'mock_request_id',
      tradeType: TradeType.EXACT_INPUT,
      otherAmountThreshold: '16780', // 99 USDC minimum out
      priceImpactPct: '0',
      slippageBps: 50,
      transaction: 'mock_transaction_string',
      inputAmount: UnifiedCurrencyAmount.fromRawAmount(MOCK_SOL, '100000'),
      outputAmount: UnifiedCurrencyAmount.fromRawAmount(MOCK_USDC, '16862'),

      routes: [
        {
          swapInfo: {
            ammKey: new PublicKey('HToiT8XK8GHgAT4N3oGXadc7opdApPwsbCL9tFRYa3Rg'),
            label: 'Meteora DLMM',
            inputMint: MOCK_SOL.address,
            outputMint: MOCK_TOKEN_1.address,
            inAmount: '52000',
            outAmount: '8771',
            feeAmount: '17',
            feeMint: new PublicKey(MOCK_SOL.address),
          },
          percent: 50,
          bps: 5200,
        },
        {
          swapInfo: {
            ammKey: new PublicKey('3YnYpQMUnUFxd9D1GSx6k1sNM9XcYLy2T68ymuu1WutH'),
            label: 'Stabble Stable Swap',
            inputMint: MOCK_TOKEN_1.address,
            outputMint: MOCK_USDC.address,
            inAmount: '8771',
            outAmount: '8772',
            feeAmount: '0',
            feeMint: new PublicKey(MOCK_USDC.address),
          },
          percent: 100,
          bps: 10000,
        },
        {
          swapInfo: {
            ammKey: new PublicKey('81MPQqJY58rgT83sy99MkRHs2g3dyy6uWKHD24twV62F'),
            label: 'Meteora DLMM',
            inputMint: MOCK_SOL.address,
            outputMint: MOCK_USDC.address,
            inAmount: '6000',
            outAmount: '1014',
            feeAmount: '2',
            feeMint: new PublicKey(MOCK_SOL.address),
          },
          percent: 20,
          bps: 600,
        },
        {
          swapInfo: {
            ammKey: new PublicKey('81MPQqJY58rgT83sy99MkRHs2g3dyy6uWKHD24twV62F'),
            label: 'Meteora DLMM',
            inputMint: MOCK_SOL.address,
            outputMint: MOCK_USDC.address,
            inAmount: '6000',
            outAmount: '1014',
            feeAmount: '2',
            feeMint: new PublicKey(MOCK_SOL.address),
          },
          percent: 30,
          bps: 600,
        },
      ],
    }

    const routes = parseRoutePlansToRoutes(mockSolRouterTrade)

    expect(routes).toHaveLength(3)

    const [route1, route2, route3] = routes

    expect(route1.pools).toHaveLength(2)
    expect(route1.percent).toBe(50)
    expect(route1.path[0]).toBe(MOCK_SOL)
    expect(route1.path[1].wrapped.address).toBe(MOCK_TOKEN_1.address)
    expect(route1.path[2]).toBe(MOCK_USDC)

    expect(route2.pools).toHaveLength(1)
    expect(route2.percent).toBe(20)
    expect(route2.path[0]).toBe(MOCK_SOL)
    expect(route2.path[1]).toBe(MOCK_USDC)

    expect(route3.pools).toHaveLength(1)
    expect(route3.percent).toBe(30)
    expect(route3.path[0]).toBe(MOCK_SOL)
    expect(route3.path[1]).toBe(MOCK_USDC)
  })

  it('should work with multi-hop in middle', () => {
    const mockSolRouterTrade: SolRouterTrade = {
      requestId: 'mock_request_id',
      tradeType: TradeType.EXACT_INPUT,
      otherAmountThreshold: '16780', // 99 USDC minimum out
      priceImpactPct: '0',
      slippageBps: 50,
      transaction: 'mock_transaction_string',
      inputAmount: UnifiedCurrencyAmount.fromRawAmount(MOCK_SOL, '100000'),
      outputAmount: UnifiedCurrencyAmount.fromRawAmount(MOCK_USDC, '16862'),

      routes: [
        {
          swapInfo: {
            ammKey: new PublicKey('AvBSC1KmFNceHpD6jyyXBV6gMXFxZ8BJJ3HVUN8kCurJ'),
            label: 'Obric V2',
            inputMint: MOCK_SOL.address,
            outputMint: MOCK_USDC.address,
            inAmount: '42000',
            outAmount: '7083',
            feeAmount: '0',
            feeMint: new PublicKey(MOCK_SOL.address),
          },
          percent: 42,
          bps: 4200,
        },
        {
          swapInfo: {
            ammKey: new PublicKey('HToiT8XK8GHgAT4N3oGXadc7opdApPwsbCL9tFRYa3Rg'),
            label: 'Meteora DLMM',
            inputMint: MOCK_SOL.address,
            outputMint: MOCK_TOKEN_1.address,
            inAmount: '52000',
            outAmount: '8771',
            feeAmount: '17',
            feeMint: new PublicKey(MOCK_SOL.address),
          },
          percent: 52,
          bps: 5200,
        },
        {
          swapInfo: {
            ammKey: new PublicKey('3YnYpQMUnUFxd9D1GSx6k1sNM9XcYLy2T68ymuu1WutH'),
            label: 'Stabble Stable Swap',
            inputMint: MOCK_TOKEN_1.address,
            outputMint: MOCK_TOKEN_2.address,
            inAmount: '8771',
            outAmount: '8772',
            feeAmount: '0',
            feeMint: new PublicKey(MOCK_USDC.address),
          },
          percent: 100,
          bps: 10000,
        },
        {
          swapInfo: {
            ammKey: new PublicKey('3YnYpQMUnUFxd9D1GSx6k1sNM9XcYLy2T68ymuu1WutH'),
            label: 'Stabble Stable Swap',
            inputMint: MOCK_TOKEN_2.address,
            outputMint: MOCK_USDC.address,
            inAmount: '8771',
            outAmount: '8772',
            feeAmount: '0',
            feeMint: new PublicKey(MOCK_USDC.address),
          },
          percent: 100,
          bps: 10000,
        },
        {
          swapInfo: {
            ammKey: new PublicKey('81MPQqJY58rgT83sy99MkRHs2g3dyy6uWKHD24twV62F'),
            label: 'Meteora DLMM',
            inputMint: MOCK_SOL.address,
            outputMint: MOCK_USDC.address,
            inAmount: '6000',
            outAmount: '1014',
            feeAmount: '2',
            feeMint: new PublicKey(MOCK_SOL.address),
          },
          percent: 6,
          bps: 600,
        },
      ],
    }

    const routes = parseRoutePlansToRoutes(mockSolRouterTrade)

    expect(routes).toHaveLength(3)

    const [route1, route2, route3] = routes

    // Route 1
    expect(route1.pools).toHaveLength(1)
    expect(route1.percent).toBe(42)

    expect(route1.path.length).toBe(2)
    expect(route1.path[0]).toBe(MOCK_SOL)
    expect(route1.path[1]).toBe(MOCK_USDC)

    // Route 2
    expect(route2.pools).toHaveLength(3)
    expect(route2.percent).toBe(52)

    expect(route2.path.length).toBe(4)
    expect(route2.path[0]).toBe(MOCK_SOL)
    expect(route2.path[1].wrapped.address).toBe(MOCK_TOKEN_1.address)
    expect(route2.path[2].wrapped.address).toBe(MOCK_TOKEN_2.address)
    expect(route2.path[3]).toBe(MOCK_USDC)

    // Route 3
    expect(route3.pools).toHaveLength(1)
    expect(route3.percent).toBe(6)

    expect(route3.path.length).toBe(2)
    expect(route3.path[0]).toBe(MOCK_SOL)
    expect(route3.path[1]).toBe(MOCK_USDC)
  })

  it('should work with multi-hop in last', () => {
    const mockSolRouterTrade: SolRouterTrade = {
      requestId: 'mock_request_id',
      tradeType: TradeType.EXACT_INPUT,
      otherAmountThreshold: '99000000', // 99 USDC minimum out
      priceImpactPct: '0.0002', // 0.15%
      slippageBps: 50,
      transaction: 'mock_transaction_string',
      inputAmount: UnifiedCurrencyAmount.fromRawAmount(MOCK_SOL, '1000000'),
      outputAmount: UnifiedCurrencyAmount.fromRawAmount(MOCK_USDC, '289245979504'),
      routes: [
        {
          swapInfo: {
            ammKey: new PublicKey('DbuvwPuLvH8uy2B1sKuu18aCd2QpCvfZdfDtdRZztBd2'),
            label: '1DEX',
            inputMint: MOCK_SOL.address,
            outputMint: MOCK_USDC.address,
            inAmount: '570000',
            outAmount: '96043',
            feeAmount: '57',
            feeMint: new PublicKey(MOCK_SOL.address),
          },
          percent: 57,
          bps: 5700,
        },
        {
          swapInfo: {
            ammKey: new PublicKey('81MPQqJY58rgT83sy99MkRHs2g3dyy6uWKHD24twV62F'),
            label: 'Meteora DLMM',
            inputMint: MOCK_SOL.address,
            outputMint: MOCK_TOKEN_1.address,
            inAmount: '430000',
            outAmount: '73121',
            feeAmount: '67',
            feeMint: new PublicKey(MOCK_SOL.address),
          },
          percent: 43,
          bps: 4300,
        },
        {
          swapInfo: {
            ammKey: new PublicKey('F4i12x6vu71dhHpWBrpRjPYGnNFqH4emVPrsPZydB5c9'),
            label: 'Raydium',
            inputMint: MOCK_TOKEN_1.address,
            outputMint: MOCK_USDC.address,
            inAmount: '169164',
            outAmount: '290730861722',
            feeAmount: '161',
            feeMint: new PublicKey(MOCK_USDC.address),
          },
          percent: 100,
          bps: 10000,
        },
      ],
    }

    const routes = parseRoutePlansToRoutes(mockSolRouterTrade)

    expect(routes).toHaveLength(2)

    const [route1, route2] = routes

    expect(route1.pools).toHaveLength(1)
    expect(route1.percent).toBe(57)

    expect(route1.path.length).toBe(2)
    expect(route1.path[0]).toBe(MOCK_SOL)
    expect(route1.path[1]).toBe(MOCK_USDC)

    expect(route2.pools).toHaveLength(2)
    expect(route2.percent).toBe(43)

    expect(route2.path.length).toBe(3)
    expect(route2.path[0]).toBe(MOCK_SOL)
    expect(route2.path[1].wrapped.address).toBe(MOCK_TOKEN_1.address)
    expect(route2.path[2]).toBe(MOCK_USDC)
  })

  it('should work with all multi-hop', () => {
    const mockSolRouterTrade: SolRouterTrade = {
      requestId: 'mock_request_id',
      tradeType: TradeType.EXACT_INPUT,
      otherAmountThreshold: '99000000', // 99 USDC minimum out
      priceImpactPct: '0.0002', // 0.15%
      slippageBps: 50,
      transaction: 'mock_transaction_string',
      inputAmount: UnifiedCurrencyAmount.fromRawAmount(MOCK_SOL, '1000000'),
      outputAmount: UnifiedCurrencyAmount.fromRawAmount(MOCK_USDC, '289245979504'),
      routes: [
        {
          swapInfo: {
            ammKey: new PublicKey('DbuvwPuLvH8uy2B1sKuu18aCd2QpCvfZdfDtdRZztBd2'),
            label: '1DEX',
            inputMint: MOCK_SOL.address,
            outputMint: MOCK_TOKEN_1.address,
            inAmount: '570000',
            outAmount: '96043',
            feeAmount: '57',
            feeMint: new PublicKey(MOCK_SOL.address),
          },
          percent: 30,
          bps: 5700,
        },
        {
          swapInfo: {
            ammKey: new PublicKey('81MPQqJY58rgT83sy99MkRHs2g3dyy6uWKHD24twV62F'),
            label: 'Meteora DLMM',
            inputMint: MOCK_TOKEN_1.address,
            outputMint: MOCK_USDC.address,
            inAmount: '430000',
            outAmount: '73121',
            feeAmount: '67',
            feeMint: new PublicKey(MOCK_SOL.address),
          },
          percent: 100,
          bps: 4300,
        },
        {
          swapInfo: {
            ammKey: new PublicKey('F4i12x6vu71dhHpWBrpRjPYGnNFqH4emVPrsPZydB5c9'),
            label: 'Raydium',
            inputMint: MOCK_SOL.address,
            outputMint: MOCK_TOKEN_2.address,
            inAmount: '169164',
            outAmount: '290730861722',
            feeAmount: '161',
            feeMint: new PublicKey(MOCK_USDC.address),
          },
          percent: 70,
          bps: 10000,
        },
        {
          swapInfo: {
            ammKey: new PublicKey('F4i12x6vu71dhHpWBrpRjPYGnNFqH4emVPrsPZydB5c9'),
            label: 'Raydium',
            inputMint: MOCK_TOKEN_2.address,
            outputMint: MOCK_USDC.address,
            inAmount: '169164',
            outAmount: '290730861722',
            feeAmount: '161',
            feeMint: new PublicKey(MOCK_USDC.address),
          },
          percent: 100,
          bps: 10000,
        },
      ],
    }

    const routes = parseRoutePlansToRoutes(mockSolRouterTrade)

    expect(routes).toHaveLength(2)

    const [route1, route2] = routes

    expect(route1.pools).toHaveLength(2)
    expect(route1.percent).toBe(30)

    expect(route1.path.length).toBe(3)
    expect(route1.path[0]).toBe(MOCK_SOL)
    expect(route1.path[1].wrapped.address).toBe(MOCK_TOKEN_1.address)
    expect(route1.path[2]).toBe(MOCK_USDC)

    expect(route2.pools).toHaveLength(2)
    expect(route2.percent).toBe(70)

    expect(route2.path.length).toBe(3)
    expect(route2.path[0]).toBe(MOCK_SOL)
    expect(route2.path[1].wrapped.address).toBe(MOCK_TOKEN_2.address)
    expect(route2.path[2]).toBe(MOCK_USDC)
  })
})
