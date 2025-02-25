import { expect, test } from 'vitest'
import * as exports from './index'

test('exports', () => {
  expect(Object.keys(exports)).toMatchInlineSnapshot(`
    [
      "Token",
      "Native",
      "CurrencyAmount",
      "Price",
      "TON_OPCODES",
      "Contracts",
      "TonNetworks",
      "TonChainId",
      "TonContextEvents",
      "TonContractTypes",
      "TonContractNames",
      "NATIVE",
      "WNATIVE",
      "priceOf",
      "getOutputAmount",
      "getInputAmount",
      "Trade",
      "isTradeBetter",
      "bestTradeExactOut",
      "bestTradeExactIn",
      "storeSwap",
      "storeSwapNext",
      "storeAddLiquidity",
    ]
  `)
})
