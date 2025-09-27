import { useMemo, ReactElement, FC, useCallback, useState, useEffect } from 'react'
import { NonEVMChainId } from '@pancakeswap/chains'
import { Box, Text, Tag, FlexGap } from '@pancakeswap/uikit'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import BN from 'bn.js'
import {
  MAX_TICK,
  MIN_TICK,
  SqrtPriceMath as SolSqrtPriceMath,
  LiquidityMath,
  SqrtPriceMath,
} from '@pancakeswap/solana-core-sdk'
import { PancakeClmmProgramId } from '@pancakeswap/solana-clmm-sdk'
import { PoolInfo, SolanaV3PoolInfo } from 'state/farmsV4/state/type'
import { useBirdeyeTokenPrice } from 'hooks/solana/useBirdeyeTokenPrice'
import { formatAmount } from '@pancakeswap/utils/formatInfoNumbers'
import { formatPercentage, formatPoolDetailFiatNumber } from 'views/PoolDetail/utils'
import truncateHash from '@pancakeswap/utils/truncateHash'
import { useQueryClient } from '@tanstack/react-query'
import { displayApr } from '@pancakeswap/utils/displayApr'
import { useTranslation } from '@pancakeswap/localization'
import { useChainIdByQuery } from 'state/info/hooks'
import { Tooltips } from 'components/Tooltips'
import { AprTooltipContent } from 'views/universalFarms/components/PoolAprButtonV3/AprTooltipContent'
import { useSolanaOnchainClmmPool } from 'hooks/solana/useSolanaOnchainPool'
import { SolanaV3PositionActions } from 'views/universalFarms/components/PositionActions/SolanaV3PositionActions'
import { POSITION_STATUS } from 'state/farmsV4/state/accountPositions/type'
import { useRaydium } from 'hooks/solana/useRaydium'
import { useSolanaPriorityFee } from 'components/WalletModalV2/hooks/useSolanaPriorityFee'
import { getPositionAprCore } from 'views/universalFarms/utils/getSolanaV3PositionAprCore'
import { useSolanaV3PositionItems } from 'views/universalFarms/hooks/useSolanaV3Positions'
import { useFlipCurrentPrice } from 'views/PoolDetail/state/flipCurrentPrice'

import router from 'next/router'
import { CHAIN_QUERY_NAME } from 'config/chains'
import { PERSIST_CHAIN_KEY } from 'config/constants'
import { Protocol } from '@pancakeswap/farms'
import { PositionsTable } from './PositionsTable'
import { EmptyPositionCard, LoadingCard } from './UtilityCards'
import { PriceRangeDisplay } from './PriceRangeDisplay'
import { PrimaryOutlineButton } from '../styles'
import { SolanaV3EarningsCell } from './PoolEarningsCells'
import { PositionFilter } from './types'

interface V3PositionsTableProps {
  poolInfo: SolanaV3PoolInfo
}

type SolanaPositionRow = {
  tokenId: string
  amountADec?: number
  amountBDec?: number
  tableRow: {
    tokenInfo: ReactElement
    liquidity: ReactElement
    earnings: ReactElement
    apr: ReactElement
    aprValue: { apr: number; fee: { apr: number } }
    priceRange: ReactElement
    actions?: ReactElement
    tokenId: string | number | bigint
  }
}

// NOTE: Data fetching and transformation now reuses useSolanaV3PositionItems hook

export const SolanaV3PositionsTable: FC<V3PositionsTableProps> = ({ poolInfo }) => {
  const { t } = useTranslation()
  const { solanaAccount } = useAccountActiveChain()
  const chainId = useChainIdByQuery()
  const [filter, setFilter] = useState<PositionFilter>(PositionFilter.All)

  const solPoolId = poolInfo?.poolId
  const { data: poolOnchain } = useSolanaOnchainClmmPool(poolInfo?.poolId)
  const [flipCurrentPrice] = useFlipCurrentPrice()

  // Reuse shared hook to get positions, then filter by this pool
  const { solanaPositions, solanaLoading } = useSolanaV3PositionItems({
    selectedNetwork: [NonEVMChainId.SOLANA],
    selectedTokens: [
      `${NonEVMChainId.SOLANA}:${poolInfo.rawPool.mintA.address}`,
      `${NonEVMChainId.SOLANA}:${poolInfo.rawPool.mintB.address}`,
    ],
    positionStatus: POSITION_STATUS.ALL,
    farmsOnly: false,
  })
  const positionsInThisPool = useMemo(
    () => solanaPositions.filter((p: any) => p.poolId.toBase58?.() === solPoolId),
    [solanaPositions, solPoolId],
  )

  const raydium = useRaydium()
  const { computeBudgetConfig } = useSolanaPriorityFee()
  const [sending, setSending] = useState(false)
  const queryClient = useQueryClient()

  const handleHarvestAll = useCallback(async () => {
    if (sending || !raydium || !poolInfo?.poolId || !solanaAccount) return
    try {
      setSending(true)
      const { poolId } = poolInfo

      // Use raydium instance from hook
      const programId = PancakeClmmProgramId['mainnet-beta']
      const ownerPositions = await raydium.clmm.getOwnerPositionInfo({ programId })
      const positions = ownerPositions
        .filter((p) => p.poolId.toBase58() === poolId)
        .filter((p) => !(p.liquidity as BN).isZero())

      if (!positions.length) {
        setSending(false)
        return
      }

      const allPoolInfo = { [poolId]: poolInfo.rawPool }
      const allPositions = { [poolId]: positions }

      const buildData = await raydium.clmm.harvestAllRewards({
        allPoolInfo,
        allPositions,
        ownerInfo: { useSOLBalance: true },
        programId: PancakeClmmProgramId['mainnet-beta'],
        computeBudgetConfig,
      })

      await buildData.execute({ sequentially: true })
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['solana-v3-positions'], exact: false }),
        queryClient.invalidateQueries({
          queryKey: ['solana-v3-reward-info-from-simulation', poolInfo.poolId],
          exact: false,
        }),
      ])
      setEarningsUsdMap({})
    } catch (e) {
      console.error(e)
    } finally {
      setSending(false)
    }
  }, [solanaAccount, poolInfo, sending, raydium, computeBudgetConfig, queryClient])

  const tokenMints = useMemo(() => {
    const solData = poolInfo?.rawPool
    const mintA = solData?.mintA?.address
    const mintB = solData?.mintB?.address
    const rewardMints = (poolOnchain?.computePoolInfo?.rewardInfos || [])
      .map((ri: any) => ri?.tokenMint?.toBase58?.())
      .filter(Boolean)
    return [mintA, mintB, ...(rewardMints as string[])]
  }, [poolInfo, poolOnchain?.computePoolInfo])

  const { data: priceMap } = useBirdeyeTokenPrice({ mintList: tokenMints, enabled: chainId === NonEVMChainId.SOLANA })

  const poolForAction = useMemo(
    () => ({ ...poolInfo, rawPool: { ...poolInfo.rawPool, price: 1 / poolInfo.rawPool.price } }),
    [poolInfo],
  )
  // Earnings map fed by per-row earnings cell
  const [earningsUsdMap, setEarningsUsdMap] = useState<Record<string, number>>({})
  const handleEarningsReady = useCallback((tokenId: string, usd: number) => {
    setEarningsUsdMap((prev) => (prev[tokenId] === usd ? prev : { ...prev, [tokenId]: usd }))
  }, [])

  const rowsDisplay: SolanaPositionRow[] = useMemo(() => {
    if (!positionsInThisPool?.length || !poolOnchain?.computePoolInfo) return []

    const sqrtCurrent = poolOnchain.computePoolInfo.sqrtPriceX64 as BN
    const currentPriceRaw = poolOnchain?.computePoolInfo?.currentPrice?.toNumber?.() ?? undefined
    const currentPriceNum =
      flipCurrentPrice && currentPriceRaw && Number.isFinite(currentPriceRaw) && currentPriceRaw > 0
        ? 1 / currentPriceRaw
        : currentPriceRaw

    return positionsInThisPool.map((p: any) => {
      const nft = p.nftMint.toBase58()

      // Compute token amounts from liquidity
      const sqrtLower = SqrtPriceMath.getSqrtPriceX64FromTick(p.tickLower)
      const sqrtUpper = SqrtPriceMath.getSqrtPriceX64FromTick(p.tickUpper)
      const { amountA, amountB } = LiquidityMath.getAmountsFromLiquidity(
        sqrtCurrent,
        sqrtLower,
        sqrtUpper,
        p.liquidity as BN,
        false,
      )
      const amountADec = Number(amountA.toString()) / 10 ** poolInfo.token0.decimals
      const amountBDec = Number(amountB.toString()) / 10 ** poolInfo.token1.decimals

      // Price range from ticks
      let minPriceStr = '0'
      let maxPriceStr = '∞'
      try {
        if (p.tickLower > MIN_TICK) {
          const sqrtLower2 = SolSqrtPriceMath.getSqrtPriceX64FromTick(p.tickLower)
          const minPrice = SolSqrtPriceMath.sqrtPriceX64ToPrice(
            sqrtLower2,
            poolInfo.token0.decimals,
            poolInfo.token1.decimals,
          )
          minPriceStr = minPrice.toString()
        }
        if (p.tickUpper < MAX_TICK) {
          const sqrtUpper2 = SolSqrtPriceMath.getSqrtPriceX64FromTick(p.tickUpper)
          const maxPrice = SolSqrtPriceMath.sqrtPriceX64ToPrice(
            sqrtUpper2,
            poolInfo.token0.decimals,
            poolInfo.token1.decimals,
          )
          maxPriceStr = maxPrice.toString()
        }
      } catch (e) {
        // keep defaults
      }

      // Determine out-of-range using tick comparison to avoid flip-induced errors
      const tickCurrent = poolOnchain?.computePoolInfo?.tickCurrent
      const outOfRange =
        typeof tickCurrent === 'number'
          ? tickCurrent < p.tickLower || tickCurrent >= p.tickUpper
          : currentPriceRaw !== undefined &&
            (currentPriceRaw < Number(minPriceStr) || currentPriceRaw > Number(maxPriceStr))

      // If flipping, invert min/max prices when both are finite
      if (flipCurrentPrice) {
        const minFinite = minPriceStr !== '0'
        const maxFinite = maxPriceStr !== '∞'
        if (minFinite && maxFinite) {
          const minNum = Number(minPriceStr)
          const maxNum = Number(maxPriceStr)
          if (Number.isFinite(minNum) && Number.isFinite(maxNum) && minNum > 0 && maxNum > 0) {
            const flippedMin = 1 / maxNum
            const flippedMax = 1 / minNum
            minPriceStr = String(flippedMin)
            maxPriceStr = String(flippedMax)
          }
        } else if (!minFinite && maxFinite) {
          // original min was 0, after flip max becomes ∞ and min becomes 1/max
          const maxNum = Number(maxPriceStr)
          if (Number.isFinite(maxNum) && maxNum > 0) {
            minPriceStr = String(1 / maxNum)
            maxPriceStr = '∞'
          }
        } else if (minFinite && !maxFinite) {
          // original max was ∞, after flip min becomes 0 and max becomes 1/min
          const minNum = Number(minPriceStr)
          if (Number.isFinite(minNum) && minNum > 0) {
            minPriceStr = '0'
            maxPriceStr = String(1 / minNum)
          }
        }
      }

      const showPercentages =
        currentPriceNum && Number.isFinite(currentPriceNum) && minPriceStr !== '0' && maxPriceStr !== '∞'
      let minPct = ''
      let maxPct = ''
      let rangePosition = 50
      if (showPercentages) {
        const minNum = Number(minPriceStr)
        const maxNum = Number(maxPriceStr)
        minPct = formatPercentage(((minNum - currentPriceNum!) / currentPriceNum!) * 100)
        maxPct = formatPercentage(((maxNum - currentPriceNum!) / currentPriceNum!) * 100)
        rangePosition = Math.max(0, Math.min(100, ((currentPriceNum! - minNum) / (maxNum - minNum)) * 100))
      }

      const tokenInfo = (
        <FlexGap flexDirection="column" gap="4px">
          <FlexGap alignItems="center" gap="8px">
            <Text bold fontSize="16px">
              {poolInfo.token0.symbol} / {poolInfo.token1.symbol}{' '}
              <Text as="span" color="textSubtle">
                #{truncateHash(nft)}
              </Text>
            </Text>
            {(p.liquidity as BN).isZero() && (
              <Tag variant="tertiary" scale="sm" px="6px">
                {t('Closed')}
              </Tag>
            )}
          </FlexGap>
        </FlexGap>
      )

      const mintPrices: Record<string, { value: number }> = {}
      const [mintA, mintB] = [poolInfo.rawPool.mintA.address, poolInfo.rawPool.mintB.address]
      const priceA = mintA ? priceMap?.[mintA]?.value ?? 0 : 0
      const priceB = mintB ? priceMap?.[mintB]?.value ?? 0 : 0
      if (mintA) mintPrices[mintA] = { value: priceA }
      if (mintB) mintPrices[mintB] = { value: priceB }
      ;(poolOnchain?.computePoolInfo?.rewardInfos || []).forEach((ri: any) => {
        const m = ri?.tokenMint?.toBase58?.()
        if (m) mintPrices[m] = { value: priceMap?.[m]?.value ?? 0 }
      })

      const position = {
        ...p,
        token0: poolInfo.token0,
        token1: poolInfo.token1,
        protocol: poolInfo.protocol,
        chainId: poolInfo.chainId,
        status: outOfRange
          ? POSITION_STATUS.INACTIVE
          : p.liquidity.isZero()
          ? POSITION_STATUS.CLOSED
          : POSITION_STATUS.ACTIVE,
      }

      const aprRes = getPositionAprCore({
        poolInfo: {
          ...poolInfo.rawPool,
          liquidity: poolOnchain ? BigInt(poolOnchain?.computePoolInfo.liquidity.toNumber()) : 0n,
        },
        positionAccount: position,
        mintPrices,
        inRange: !outOfRange,
      })

      const display: SolanaPositionRow = {
        tokenId: nft,
        amountADec,
        amountBDec,
        tableRow: {
          tokenInfo,
          liquidity: (
            <Box>
              <Text fontSize="14px">
                {formatAmount(amountADec)} {poolInfo.token0.symbol}
              </Text>
              <Text fontSize="14px">
                {formatAmount(amountBDec)} {poolInfo.token1.symbol}
              </Text>
            </Box>
          ),
          earnings: (
            <Text bold fontSize="16px">
              <SolanaV3EarningsCell
                poolInfo={poolInfo}
                position={position}
                positionClosed={(p.liquidity as BN).isZero()}
                tokenId={nft}
                onReady={handleEarningsReady}
              />
            </Text>
          ),
          apr: (
            <Tooltips
              content={
                <AprTooltipContent
                  combinedApr={aprRes.apr}
                  lpFeeApr={aprRes.fee.apr}
                  cakeApr={{ value: aprRes.rewards.reduce((acc, i) => acc + i.apr, 0) }}
                  showDesc
                />
              }
            >
              <Text bold>{displayApr(aprRes.apr)}</Text>
            </Tooltips>
          ),
          aprValue: aprRes,
          priceRange: (
            <PriceRangeDisplay
              minPrice={minPriceStr}
              maxPrice={maxPriceStr}
              currentPrice={currentPriceNum ? String(currentPriceNum) : undefined}
              minPercentage={minPct}
              maxPercentage={maxPct}
              rangePosition={rangePosition}
              outOfRange={outOfRange}
              removed={(p.liquidity as BN).isZero()}
              showPercentages={Boolean(showPercentages)}
            />
          ),
          actions: (
            <SolanaV3PositionActions
              removed={(p.liquidity as BN).isZero()}
              outOfRange={outOfRange}
              chainId={NonEVMChainId.SOLANA}
              poolInfo={poolForAction}
              position={position}
            />
          ),
          tokenId: nft,
        },
      }
      return display
    })
  }, [positionsInThisPool, poolOnchain, priceMap, poolInfo, poolForAction, flipCurrentPrice])

  const computed = useMemo(() => {
    if (!rowsDisplay.length)
      return { rows: [] as (SolanaPositionRow & { liquidityUSD: number })[], totalLiq: 0, totalEarn: 0, totalApr: 0 }
    const solData = poolInfo.rawPool
    const mintA = solData?.mintA?.address
    const mintB = solData?.mintB?.address
    const priceA = mintA ? priceMap?.[mintA]?.value ?? 0 : 0
    const priceB = mintB ? priceMap?.[mintB]?.value ?? 0 : 0
    let totalLiq = 0
    let totalEarn = 0
    let aprWeightedSum = 0
    const rows = rowsDisplay.map((row) => {
      const liqUSD = (row.amountADec || 0) * priceA + (row.amountBDec || 0) * priceB
      totalLiq += liqUSD
      // Use simulation result for more accurate pending yield
      const earnUSD = earningsUsdMap[row.tokenId] ?? 0
      totalEarn += earnUSD

      aprWeightedSum += row.tableRow.aprValue.apr * liqUSD
      return {
        ...row,
        liquidityUSD: liqUSD,
        tableRow: {
          ...row.tableRow,
          liquidity: <Text bold>{formatPoolDetailFiatNumber(liqUSD)}</Text>,
        },
      }
    })
    const totalApr = totalLiq > 0 ? aprWeightedSum / totalLiq : 0
    return { rows, totalLiq, totalEarn, totalApr }
  }, [priceMap, poolInfo, rowsDisplay, earningsUsdMap])

  // Filter rows based on inactive toggle, following V3PositionsTable logic
  const filteredRows = useMemo(() => {
    const hasLiquidity = (r: { liquidityUSD: number }) => r.liquidityUSD > 0
    switch (filter) {
      case PositionFilter.Inactive:
        return computed.rows.filter((r) => hasLiquidity(r) && r.tableRow.aprValue.apr === 0)
      default:
        return computed.rows
    }
  }, [computed.rows, filter])

  if (solanaLoading) return <LoadingCard />
  if (!computed.rows.length) return <EmptyPositionCard />

  return (
    <>
      <PositionsTable
        poolInfo={poolInfo as PoolInfo}
        totalLiquidityUSD={filteredRows.reduce((sum, r) => sum + r.liquidityUSD, 0)}
        totalApr={computed.totalApr}
        totalEarnings={formatPoolDetailFiatNumber(computed.totalEarn)}
        data={filteredRows.map((r) => r.tableRow)}
        showInactiveOnly={filter === PositionFilter.Inactive}
        toggleInactiveOnly={() =>
          setFilter(filter === PositionFilter.Inactive ? PositionFilter.All : PositionFilter.Inactive)
        }
        onlyFarmHarvest={false}
        harvestAllButton={
          <PrimaryOutlineButton onClick={handleHarvestAll} disabled={sending || !computed.totalEarn}>
            {sending ? t('Harvesting...') : t('Harvest All')}
          </PrimaryOutlineButton>
        }
        onRowClick={(row) => {
          router.push(
            `/liquidity/position/${Protocol.V3}/solana/${poolInfo.lpAddress}/${row.tokenId}?chain=${
              CHAIN_QUERY_NAME[poolInfo.chainId]
            }&${PERSIST_CHAIN_KEY}=1`,
          )
        }}
      />
    </>
  )
}
