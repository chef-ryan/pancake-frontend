import { expect, test } from 'vitest'
import * as exports from './index'

test('exports', () => {
  expect(Object.keys(exports)).toMatchInlineSnapshot(`
    [
      "Token",
      "Native",
      "CurrencyAmount",
      "priceOf",
      "getAddress",
      "getOutputAmount",
      "getInputAmount",
      "Trade",
      "swapCallParameters",
    ]
  `)
})
