import { SCALE_OFFSET, getPriceX128FromId } from '@pancakeswap/infinity-sdk'
import BN from 'bignumber.js'

export function calculateBinLiquidityByReserve({
  lowerBinId,
  upperBinId,
  binStep,
  reserveX,
  reserveY,
  activeBinId,
}: {
  lowerBinId: number | undefined | null
  upperBinId: number | undefined | null
  binStep: number | undefined
  reserveX: bigint | undefined | null
  reserveY: bigint | undefined | null
  activeBinId: number | undefined
}) {
  if (!lowerBinId || !upperBinId || !binStep || !activeBinId) {
    return undefined
  }
  const aboveBins: number[] = []
  const belowBins: number[] = []

  for (let binId = lowerBinId; binId <= upperBinId; binId++) {
    if (binId > activeBinId) {
      aboveBins.push(binId)
    } else {
      belowBins.push(binId)
    }
  }

  const amountYPerBin = reserveY ? new BN(reserveY.toString()).dividedBy(aboveBins.length + 1) : new BN(0)
  const amountXPerBin = reserveX ? new BN(reserveX.toString()).dividedBy(belowBins.length + 1) : new BN(0)

  let totalLiquidity = new BN('0')

  for (let binId = lowerBinId; binId <= upperBinId; binId++) {
    const price = getPriceX128FromId(BigInt(binId), BigInt(binStep))
    if (binId === activeBinId) {
      totalLiquidity = totalLiquidity
        ?.plus(amountXPerBin.multipliedBy(price.toString()))
        .plus(amountYPerBin.shiftedBy(Number(SCALE_OFFSET)))
    } else if (binId > activeBinId) {
      totalLiquidity = totalLiquidity?.plus(amountYPerBin.shiftedBy(Number(SCALE_OFFSET)))
    } else {
      totalLiquidity = totalLiquidity?.plus(amountXPerBin.multipliedBy(price.toString()))
    }
  }

  return totalLiquidity
}
