import { memo, useMemo } from 'react'
import { PositionInfoLayout, PositionUtils, TickUtils } from '@pancakeswap/solana-core-sdk'
import { NonEVMChainId } from '@pancakeswap/chains'
import { Price, UnifiedCurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { Protocol } from '@pancakeswap/farms'
import { SolanaV3PoolInfo } from 'state/farmsV4/state/type'
import { useSolanaTokenInfo } from 'hooks/solana/useSolanaTokenInfo'
import { POSITION_STATUS } from 'state/farmsV4/state/accountPositions/type'
import { SolanaV3Pool } from 'state/pools/solana'
import { PriceRange } from './PriceRange'
import { PositionItem } from './PositionItem'

type SolanaV3PositionItemProps = {
  position: ReturnType<typeof PositionInfoLayout.decode> & { status: POSITION_STATUS }
  poolInfo: SolanaV3Pool | undefined
  detailMode?: boolean
}

export const SolanaV3PositionItem = memo(({ position, poolInfo, detailMode }: SolanaV3PositionItemProps) => {
  const currency0 = useSolanaTokenInfo(poolInfo?.mintA.address)
  const currency1 = useSolanaTokenInfo(poolInfo?.mintB.address)

  const [priceUpper, priceLower] = useMemo(() => {
    if (!currency0 || !currency1 || !poolInfo) {
      return [undefined, undefined]
    }
    const [upper, lower] = [
      TickUtils.getTickPrice({
        poolInfo,
        tick: position.tickUpper,
        baseIn: true,
      }),
      TickUtils.getTickPrice({
        poolInfo,
        tick: position.tickLower,
        baseIn: true,
      }),
    ]
    const [upperNum, upperDen] = upper.price.toFraction()
    const [lowerNum, lowerDen] = lower.price.toFraction()
    return [
      new Price(currency0, currency1, upperNum.toFixed(0), upperDen.toFixed(0)),
      new Price(currency0, currency1, lowerNum.toFixed(0), lowerDen.toFixed(0)),
    ]
  }, [poolInfo, position.tickUpper, position.tickLower])

  const [amount0, amount1] = useMemo(() => {
    if (!currency0 || !currency1 || !poolInfo) {
      return [undefined, undefined]
    }
    const { amountA, amountB } = PositionUtils.getAmountsFromLiquidity({
      poolInfo,
      ownerPosition: position,
      liquidity: position.liquidity,
      slippage: 0,
      add: false,
      epochInfo: {
        epoch: 0,
        slotIndex: 0,
        slotsInEpoch: 0,
        absoluteSlot: 0,
      },
    })
    return [
      UnifiedCurrencyAmount.fromRawAmount(currency0, amountA.amount.toString()),
      UnifiedCurrencyAmount.fromRawAmount(currency1, amountB.amount.toString()),
    ]
  }, [poolInfo, position.liquidity])

  const tickAtLimit = useMemo(() => ({ LOWER: false, UPPER: false }), [])

  // Mock pool data
  const pool = useMemo(() => {
    if (!currency0 || !currency1 || !poolInfo) {
      return undefined
    }
    return {
      pid: 0,
      lpAddress: position.nftMint.toBase58(),
      protocol: Protocol.V3,
      token0: currency0,
      token1: currency1,
      feeTier: poolInfo.feeRate,
      feeTierBase: 10000,
      isFarming: false,
      poolId: position.poolId.toBase58(),
      liquidity: BigInt(position.liquidity.toString()),
      chainId: NonEVMChainId.SOLANA,
      tvlUsd: poolInfo.tvl.toString() as `${number}`,
    } satisfies SolanaV3PoolInfo
  }, [currency0, currency1, poolInfo?.feeRate, position.liquidity, position.poolId])

  const totalPriceUSD = useMemo(() => 0, []) // Should be calculated from position amounts and token prices

  const desc = useMemo(() => {
    // For now, return a simple description
    // In real implementation, this should show proper price range
    return (
      <PriceRange
        base={currency0 ?? undefined}
        quote={currency1 ?? undefined}
        priceLower={priceLower}
        priceUpper={priceUpper}
        tickAtLimit={tickAtLimit}
      />
    )
  }, [currency0, currency1, priceLower, priceUpper, tickAtLimit])

  return (
    <PositionItem
      chainId={NonEVMChainId.SOLANA}
      link={`/liquidity/${position.nftMint.toBase58()}`}
      pool={pool}
      totalPriceUSD={totalPriceUSD}
      amount0={amount0}
      amount1={amount1}
      desc={desc}
      currency0={currency0 ?? undefined}
      currency1={currency1 ?? undefined}
      removed={position.liquidity.isZero()}
      outOfRange={position.status === POSITION_STATUS.INACTIVE}
      fee={poolInfo?.feeRate ?? 0}
      feeTierBase={1}
      protocol={Protocol.V3}
      isStaked={false}
      detailMode={detailMode}
      userPosition={position}
    >
      {/* Solana positions might need different action components */}
      {/* For now, we'll leave this empty until Solana-specific actions are implemented */}
      {currency0 && currency1 ? (
        <div>
          {/* TODO: Implement Solana-specific position actions */}
          {/* This could include harvest, increase/decrease liquidity, etc. */}
        </div>
      ) : null}
    </PositionItem>
  )
})

SolanaV3PositionItem.displayName = 'SolanaV3PositionItem'
