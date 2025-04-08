import { ClassicOrder, XOrder } from '@pancakeswap/price-api-sdk'
import { getPoolAddress } from '@pancakeswap/smart-router'
import { ZERO_ADDRESS } from '@pancakeswap/swap-sdk-core'
import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { keccak256, stringify } from 'viem/utils'
import { InterfaceOrder, isClassicOrder } from 'views/Swap/utils'
import { useAllTypeBestTrade } from './quoter/useAllTypeBestTrade'

export const QuoteProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      {children}
      <Sync />
    </>
  )
}

type QuoterType = typeof useAllTypeBestTrade

const allTypeBestTradeAtom = atom<ReturnType<QuoterType>>({
  ammOrder: undefined,
  xOrder: undefined,
  betterOrder: undefined,
  bestOrder: undefined,
  tradeLoaded: false,
  tradeError: undefined,
  refreshDisabled: false,
  refreshOrder: () => {},
  refreshTrade: () => {},
  pauseQuoting: () => {},
  resumeQuoting: () => {},
})

export const useAllTypeBestTradeSync = () => {
  const allTypeBestTrade = useAtomValue(allTypeBestTradeAtom)
  return allTypeBestTrade
}

const hashInterfaceOrder = (order?: InterfaceOrder) => {
  if (!order) {
    return 'empty-trade'
  }
  if (isClassicOrder(order)) {
    return hashClassicOrder(order)
  }
  return hashXOrder(order)
}

const hashClassicOrder = (order: ClassicOrder) => {
  const { trade, type } = order

  if (!trade) {
    const parts = ['classic', type]
    return keccak256(`0x${stringify(parts)}`)
  }

  const { inputAmount, outputAmount, routes, tradeType } = trade
  const parts = [
    'classic',
    type,
    tradeType,
    inputAmount.currency.isNative ? ZERO_ADDRESS : inputAmount.currency.address,
    inputAmount.toExact(),
    outputAmount.currency.isNative ? ZERO_ADDRESS : outputAmount.currency.address,
    outputAmount.toExact(),
    routes.map((route) => {
      return route.pools.map((pool) => {
        return getPoolAddress(pool)
      })
    }),
  ]
  return keccak256(`0x${stringify(parts)}`)
}

const hashXOrder = (order: XOrder) => {
  const { type, ammTrade } = order

  if (!ammTrade) {
    const parts = ['xorder', type]
    return keccak256(`0x${stringify(parts)}`)
  }
  const { routes, inputAmount, outputAmount, tradeType } = ammTrade

  const parts = [
    'xorder',
    type,
    tradeType,
    inputAmount.currency.isNative ? ZERO_ADDRESS : inputAmount.currency.address,
    inputAmount.toExact(),
    outputAmount.currency.isNative ? ZERO_ADDRESS : outputAmount.currency.address,
    outputAmount.toExact(),
    routes.map((route) => {
      return route.pools.map((pool) => {
        return getPoolAddress(pool)
      })
    }),
  ]
  return keccak256(`0x${stringify(parts)}`)
}

const Sync = () => {
  const result = useAllTypeBestTrade()

  const hash = hashInterfaceOrder(result.bestOrder as InterfaceOrder)
  const setBestTrade = useSetAtom(allTypeBestTradeAtom)

  useEffect(() => {
    setBestTrade(result)
    console.log('[hash]', hash)
  }, [hash, result.pauseQuoting, result.resumeQuoting, result.tradeError, result.tradeLoaded])

  return null
}
