import { expect, test } from 'vitest'
import * as exports from './index'

test('exports', () => {
  expect(Object.keys(exports)).toMatchInlineSnapshot(`
    [
      "Token",
      "Native",
      "CurrencyAmount",
      "TON_OPCODES",
      "priceOf",
      "getAddress",
      "getOutputAmount",
      "getInputAmount",
      "Trade",
      "storeSwap",
      "storeSwapNext",
      "storeAddLiquidity",
    ]
  `)
})
