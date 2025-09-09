import { memo, useMemo, useState } from 'react'
import { PositionInfoLayout, PositionUtils, TickUtils, TokenInfo } from '@pancakeswap/solana-core-sdk'
import { NonEVMChainId } from '@pancakeswap/chains'
import BigNumber from 'bignumber.js'
import { Price, UnifiedCurrencyAmount } from '@pancakeswap/swap-sdk-core'
import { Protocol } from '@pancakeswap/farms'
import { SolanaV3PoolInfo } from 'state/farmsV4/state/type'
import { POSITION_STATUS, SolanaV3PositionDetail } from 'state/farmsV4/state/accountPositions/type'
import { SolanaV3Pool } from 'state/pools/solana'
import { useSolanaTokenPrice } from 'hooks/solana/useSolanaTokenPrice'
import { convertRawTokenInfoIntoSPLToken } from 'config/solana-list'
import { calculateSolanaTickLimits, calculateTickLimits, getTickAtLimitStatus } from 'views/PoolDetail/utils'
import { PriceRange } from './PriceRange'
import { PositionItem } from './PositionItem'
import { SolanaV3PositionActions } from '../PositionActions/SolanaV3PositionActions'

type SolanaV3PositionItemProps = {
  position: SolanaV3PositionDetail
  poolInfo: SolanaV3Pool | undefined
  detailMode?: boolean
}

export const SolanaV3PositionItem = memo(({ position, poolInfo, detailMode }: SolanaV3PositionItemProps) => {
  const currency0 = useMemo(() => convertRawTokenInfoIntoSPLToken(poolInfo?.mintA as TokenInfo), [poolInfo?.mintA])
  const currency1 = useMemo(() => convertRawTokenInfoIntoSPLToken(poolInfo?.mintB as TokenInfo), [poolInfo?.mintB])

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

    return [
      Price.fromDecimal(currency0, currency1, new BigNumber(upper.price.toString()).toFixed()),
      Price.fromDecimal(currency0, currency1, new BigNumber(lower.price.toString()).toFixed()),
    ]
  }, [poolInfo, position.tickUpper, position.tickLower, currency0, currency1])

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

  const tickAtLimit = useMemo(() => {
    const tickLimits = calculateSolanaTickLimits(poolInfo?.config.tickSpacing)
    return getTickAtLimitStatus(position.tickLower, position.tickUpper, tickLimits)
  }, [poolInfo?.config.tickSpacing, position.tickLower, position.tickUpper])

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
      rawPool: poolInfo,
    } satisfies SolanaV3PoolInfo
  }, [currency0, currency1, poolInfo?.feeRate, position.liquidity, position.poolId])

  const { data: currency0Price } = useSolanaTokenPrice({
    mint: currency0?.wrapped.address,
    enabled: Boolean(currency0),
  })
  const { data: currency1Price } = useSolanaTokenPrice({
    mint: currency1?.wrapped.address,
    enabled: Boolean(currency1),
  })

  const totalPriceUSD = useMemo(() => {
    return (
      Number(currency0Price ?? 0) * Number(amount0?.toExact() ?? 0) +
      Number(currency1Price ?? 0) * Number(amount1?.toExact() ?? 0)
    )
  }, [currency0Price, currency1Price, amount0, amount1])

  const desc = useMemo(() => {
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
      {currency0 && currency1 ? (
        <SolanaV3PositionActions
          removed={position.liquidity.isZero()}
          outOfRange={position.status === POSITION_STATUS.INACTIVE}
          chainId={NonEVMChainId.SOLANA}
          detailMode={detailMode}
        />
      ) : null}
    </PositionItem>
  )
})

SolanaV3PositionItem.displayName = 'SolanaV3PositionItem'
