import { useActiveChainId } from 'hooks/useAccountActiveChain'
import { NonEVMChainId } from '@pancakeswap/chains'
import { useCallback, useMemo } from 'react'
import { TickUtils } from '@pancakeswap/solana-core-sdk'
import { tryParsePrice } from 'hooks/v3/utils'
import Decimal from 'decimal.js'
import { useClmmAmmConfigs } from './useClmmAmmConfigs'

/**
 * Returns a function that, for Solana, converts a tick to a snapped price using
 * CLMM AMM config tick spacing and token decimals. For non-Solana chains or
 * missing data, it returns undefined.
 */
export const useGetTickPrice = (baseCurrency?: any, quoteCurrency?: any, feeAmount?: number) => {
  const { chainId } = useActiveChainId()
  const ammConfigs = useClmmAmmConfigs()

  const tickSpacing = useMemo(() => {
    if (chainId !== NonEVMChainId.SOLANA || !feeAmount) return undefined
    const candidates = Object.values(ammConfigs).filter((c) => c.tradeFeeRate === Number(feeAmount))
    if (!candidates.length) return undefined
    return Math.min(...candidates.map((c) => c.tickSpacing))
  }, [ammConfigs, chainId, feeAmount])

  return useCallback(
    (tick: number, baseIn = true) => {
      if (chainId !== NonEVMChainId.SOLANA || !tickSpacing) return undefined
      const base = baseCurrency?.wrapped ?? baseCurrency
      const quote = quoteCurrency?.wrapped ?? quoteCurrency
      try {
        const poolInfo = {
          config: { tickSpacing },
          mintA: { decimals: base?.decimals ?? 9 },
          mintB: { decimals: quote?.decimals ?? 9 },
        } as any
        const r = TickUtils.getTickPrice({ poolInfo, tick, baseIn })
        const snapped = tryParsePrice(base, quote, r.price.toString?.() ?? String(r.price))
        return snapped ? { tick: r.tick, price: snapped } : undefined
      } catch {
        return undefined
      }
    },
    [chainId, tickSpacing, baseCurrency, quoteCurrency],
  )
}
