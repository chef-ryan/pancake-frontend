import { BinLiquidityShape, getLiquidityShape, getPriceX128FromId, SCALE_OFFSET } from '@pancakeswap/infinity-sdk'
import BN from 'bignumber.js'

export function getActiveLiquidityFromShape({
  activeBinId,
  lowerBinId,
  upperBinId,
  binStep,
  amount0,
  amount1,
  liquidityShape,
}: {
  activeBinId: number
  lowerBinId: number
  upperBinId: number
  binStep: number
  amount0: bigint
  amount1: bigint
  liquidityShape: BinLiquidityShape
}) {
  const shape = getLiquidityShape({
    shape: liquidityShape,
    lowerBinId,
    upperBinId,
    activeIdDesired: activeBinId,
    amount0,
    amount1,
  })
  const totalX = shape.distributionX.reduce((acc, val) => acc + val, 0n)
  const totalY = shape.distributionY.reduce((acc, val) => acc + val, 0n)
  const unitX = amount0 / totalX
  const unitY = amount1 / totalY
  const price = getPriceX128FromId(BigInt(activeBinId), BigInt(binStep))
  const activeX = shape.distributionX[activeBinId - lowerBinId]
  const activeY = shape.distributionY[activeBinId - lowerBinId]
  const Y = new BN((activeY * unitY).toString()).times(new BN(2).pow(SCALE_OFFSET.toString()))
  const activeLiquidity = Y.plus((unitX * activeX * price).toString())
  return activeLiquidity
}
