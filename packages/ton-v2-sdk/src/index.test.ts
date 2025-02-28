import { expect, test } from 'vitest'
import * as exports from './index'

test('exports', () => {
  expect(Object.keys(exports)).toMatchInlineSnapshot(`
  [
    "Contracts",
    "NATIVE",
    "TON_OPCODES",
    "TonChainId",
    "TonContextEvents",
    "TonContractNames",
    "TonContractTypes",
    "TonNetworks",
    "WNATIVE",
    "Native",
    "Token",
    "Price",
    "CurrencyAmount",
    "bestTradeExactIn",
    "bestTradeExactOut",
    "getAddressCellHash",
    "getInputAmount",
    "getOutputAmount",
    "isTradeBetter",
    "priceOf",
    "storeAddLiquidity",
    "storeSwap",
    "storeSwapNext",
    "Trade",
  ]
  `)
})
