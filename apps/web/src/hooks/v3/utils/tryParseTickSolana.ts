import { TickUtils } from '@pancakeswap/solana-core-sdk'
import Decimal from 'decimal.js'
import { MintState } from 'views/AddLiquidityV3/formViews/V3FormView/form/reducer'

export const tryParseTickSolana = ({
  tickSpacing,
  price,
  token0Decimal,
  token1Decimal,
  baseIn,
}: {
  tickSpacing: number | undefined
  price: MintState['leftRangeTypedValue'] | MintState['rightRangeTypedValue']
  token0Decimal?: number
  token1Decimal?: number
  baseIn: boolean
}): number | undefined => {
  if (!price || !tickSpacing || typeof price === 'boolean' || !token0Decimal || !token1Decimal) return undefined
  try {
    const poolInfo = {
      config: { tickSpacing },
      mintA: { decimals: token0Decimal },
      mintB: { decimals: token1Decimal },
    }
    const pDec = new Decimal(price.toSignificant(18))
    const res = TickUtils.getPriceAndTick({ poolInfo, price: pDec, baseIn })
    return res?.tick
  } catch {
    return undefined
  }
}
