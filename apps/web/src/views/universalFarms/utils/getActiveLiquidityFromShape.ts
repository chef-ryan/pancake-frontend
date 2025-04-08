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
    amount0: amount0 ?? 0n,
    amount1: amount1 ?? 0n,
  })
  const totalX = shape.distributionX.reduce((acc, val) => acc + val, 0n)
  const totalY = shape.distributionY.reduce((acc, val) => acc + val, 0n)
  const unitX = (amount0 ?? 0n) / max(totalX, 1n)
  const unitY = (amount1 ?? 0n) / max(totalY, 1n)
  const price = getPriceX128FromId(BigInt(activeBinId), BigInt(binStep))
  const activeX = shape.distributionX[activeBinId - lowerBinId] ?? 0n
  const activeY = shape.distributionY[activeBinId - lowerBinId] ?? 0n
  const Y = new BN((activeY * unitY).toString()).times(new BN(2).pow(SCALE_OFFSET.toString()))
  const X = new BN((activeX * unitX).toString()).times(price.toString())
  const activeLiquidity = new BN(0).plus(Y).plus(X)

  return activeLiquidity
}

const max = (a: bigint, b: bigint) => (a > b ? a : b)
