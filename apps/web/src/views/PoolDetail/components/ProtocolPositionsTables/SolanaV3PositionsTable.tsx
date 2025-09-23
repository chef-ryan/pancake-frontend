import { useMemo, ReactElement, FC, useCallback, useState, useEffect } from 'react'
import { NonEVMChainId } from '@pancakeswap/chains'
import { Box, Text } from '@pancakeswap/uikit'
import { PublicKey, Connection } from '@solana/web3.js'
import { useAtomValue } from 'jotai'
import { rpcUrlAtom } from '@pancakeswap/utils/user'
import useAccountActiveChain from 'hooks/useAccountActiveChain'
import BN from 'bn.js'
import {
  MAX_TICK,
  MIN_TICK,
  SqrtPriceMath as SolSqrtPriceMath,
  PositionUtils,
  Raydium,
  LiquidityMath,
  SqrtPriceMath,
  TickUtils,
} from '@pancakeswap/solana-core-sdk'
import { PancakeClmmProgramId } from '@pancakeswap/solana-clmm-sdk'
import { PoolInfo, SolanaV3PoolInfo } from 'state/farmsV4/state/type'
import { useBirdeyeTokenPrice } from 'hooks/solana/useBirdeyeTokenPrice'
import { formatAmount } from '@pancakeswap/utils/formatInfoNumbers'
import { formatPercentage, formatPoolDetailFiatNumber } from 'views/PoolDetail/utils'
import truncateHash from '@pancakeswap/utils/truncateHash'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { displayApr } from '@pancakeswap/utils/displayApr'
import { useTranslation } from '@pancakeswap/localization'
import { useChainIdByQuery } from 'state/info/hooks'
import { Tooltips } from 'components/Tooltips'
import { AprTooltipContent } from 'views/universalFarms/components/PoolAprButtonV3/AprTooltipContent'
import { AprKey, getAprForPriceRange } from 'hooks/solana/useClmmApr'
import { useSolanaOnchainClmmPool } from 'hooks/solana/useSolanaOnchainPool'
import { SolanaV3PositionActions } from 'views/universalFarms/components/PositionActions/SolanaV3PositionActions'
import { POSITION_STATUS } from 'state/farmsV4/state/accountPositions/type'
import { useRaydium } from 'hooks/solana/useRaydium'
import { useSolanaPriorityFee } from 'components/WalletModalV2/hooks/useSolanaPriorityFee'
import { useSolanaV3RewardInfoFromSimulation } from 'views/universalFarms/hooks/useSolanaV3RewardInfoFromSimulation'
import { getPositionAprCore } from 'views/universalFarms/utils/getSolanaV3PositionAprCore'

import { PositionsTable } from './PositionsTable'
import { EmptyPositionCard, LoadingCard } from './UtilityCards'
import { PriceRangeDisplay } from './PriceRangeDisplay'
import { PrimaryOutlineButton } from '../styles'

interface V3PositionsTableProps {
  poolInfo: SolanaV3PoolInfo
}

type SolanaPositionRow = {
  tokenId: string
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

const fetchSolanaPositions = async ({
  endpoint,
  account,
  poolId,
  poolInfo,
}: {
  endpoint: string
  account: string
  poolId: string
  poolInfo: SolanaV3PoolInfo
}) => {
  const connection = new Connection(endpoint, 'confirmed')
  const owner = new PublicKey(account)
  const raydium = await Raydium.load({ connection, owner, disableFeatureCheck: true, disableLoadToken: true })

  const programId = PancakeClmmProgramId['mainnet-beta']
  const positions = await raydium.clmm.getOwnerPositionInfo({ programId })
  const filtered = positions.filter((p) => p.poolId.toBase58() === poolId)

  const { computePoolInfo, tickData, poolInfo: apiPoolInfo } = await raydium.clmm.getPoolInfoFromRpc(poolId!)

  const tableBase = filtered.map((p) => {
    const nft = p.nftMint.toBase58()
    // Compute token amounts from liquidity
    const sqrtCurrent = computePoolInfo.sqrtPriceX64 as BN
    const sqrtLower = SqrtPriceMath.getSqrtPriceX64FromTick(p.tickLower)
    const sqrtUpper = SqrtPriceMath.getSqrtPriceX64FromTick(p.tickUpper)
    const { amountA, amountB } = LiquidityMath.getAmountsFromLiquidity(
      sqrtCurrent,
      sqrtLower,
      sqrtUpper,
      p.liquidity as BN,
      false,
    )

    // Compute fees and rewards owed
    const { tickSpacing } = computePoolInfo
    const arrayLowerStart = TickUtils.getTickArrayStartIndexByTick(p.tickLower, tickSpacing)
    const arrayUpperStart = TickUtils.getTickArrayStartIndexByTick(p.tickUpper, tickSpacing)
    const lowerArray = tickData[poolId]?.[arrayLowerStart]
    const upperArray = tickData[poolId]?.[arrayUpperStart]
    const lowerOffset = TickUtils.getTickOffsetInArray(p.tickLower, tickSpacing)
    const upperOffset = TickUtils.getTickOffsetInArray(p.tickUpper, tickSpacing)
    const lowerTick = lowerArray?.ticks?.[lowerOffset]
    const upperTick = upperArray?.ticks?.[upperOffset]

    let feeA = new BN(0)
    let feeB = new BN(0)
    let rewards: BN[] = []
    if (lowerTick && upperTick) {
      const fees = PositionUtils.GetPositionFeesV2(
        {
          tickCurrent: computePoolInfo.tickCurrent,
          feeGrowthGlobalX64A: computePoolInfo.feeGrowthGlobalX64A,
          feeGrowthGlobalX64B: computePoolInfo.feeGrowthGlobalX64B,
        },
        p as any,
        lowerTick as any,
        upperTick as any,
      )
      feeA = fees.tokenFeeAmountA
      feeB = fees.tokenFeeAmountB

      rewards = PositionUtils.GetPositionRewardsV2(
        {
          tickCurrent: computePoolInfo.tickCurrent,
          feeGrowthGlobalX64B: computePoolInfo.feeGrowthGlobalX64B,
          rewardInfos: computePoolInfo.rewardInfos.map((ri) => ({
            rewardGrowthGlobalX64: ri.rewardGrowthGlobalX64,
          })),
        } as any,
        p as any,
        lowerTick as any,
        upperTick as any,
      )
    }

    const tokenInfo = (
      <Box>
        <Text bold fontSize="16px">
          {poolInfo.token0.symbol} / {poolInfo.token1.symbol}{' '}
          <Text as="span" color="textSubtle">
            #{truncateHash(nft)}
          </Text>
        </Text>
      </Box>
    )

    return {
      raw: { amountA, amountB, feeA, feeB, rewards, liquidity: p.liquidity as BN },
      tokenId: nft,
      data: p,
      tokenInfo,
    }
  })

  const baseRows = tableBase.map((b) => {
    const { amountA, amountB, feeA, feeB, rewards } = b.raw
    const amountADec = Number(amountA.toString()) / 10 ** computePoolInfo.mintA.decimals
    const amountBDec = Number(amountB.toString()) / 10 ** computePoolInfo.mintB.decimals
    const feeADec = Number(feeA.toString()) / 10 ** computePoolInfo.mintA.decimals
    const feeBDec = Number(feeB.toString()) / 10 ** computePoolInfo.mintB.decimals
    const rewardAmountsDec = rewards.map((r, idx) => {
      const mint = computePoolInfo.rewardInfos[idx]?.tokenMint?.toBase58?.() || ''
      return { mint, amount: Number(r.toString()) }
    })
    return { tokenId: b.tokenId, amountADec, amountBDec, feeADec, feeBDec, rewardAmountsDec }
  })

  return { baseRows, tableBase, computePoolInfo, apiPoolInfo }
}

export const SolanaV3PositionsTable: FC<V3PositionsTableProps> = ({ poolInfo }) => {
  const { t } = useTranslation()
  const { solanaAccount } = useAccountActiveChain()
  const endpoint = useAtomValue(rpcUrlAtom)
  const chainId = useChainIdByQuery()

  const solPoolId = poolInfo?.poolId
  const { data: poolOnchain } = useSolanaOnchainClmmPool(poolInfo?.poolId)

  const { data, isLoading } = useQuery({
    queryKey: ['solana-v3-positions', endpoint, solanaAccount, chainId, solPoolId],
    enabled: Boolean(solanaAccount && chainId === NonEVMChainId.SOLANA && solPoolId),
    queryFn: () =>
      fetchSolanaPositions({
        endpoint,
        account: solanaAccount!,
        poolInfo,
        poolId: solPoolId!,
      }),
  })

  const raydium = useRaydium()
  const { computeBudgetConfig } = useSolanaPriorityFee()
  const [sending, setSending] = useState(false)
  const queryClient = useQueryClient()

  const handleHarvestAll = useCallback(async () => {
    if (sending || !raydium || !data || !poolInfo?.poolId) return
    try {
      setSending(true)
      const { poolId } = poolInfo
      const positions = (data.tableBase || []).filter((b) => !b.raw.liquidity.isZero()).map((b) => b.data)

      if (!positions.length) {
        setSending(false)
        return
      }

      const allPoolInfo = { [poolId]: poolInfo.rawPool }
      const allPositions = { [poolId]: positions as any[] }

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
  }, [poolInfo, sending, raydium, data, computeBudgetConfig, queryClient])

  const tokenMints = useMemo(() => {
    const solData = poolInfo?.rawPool
    const mintA = solData?.mintA?.address
    const mintB = solData?.mintB?.address
    const rewardMints = (data?.computePoolInfo?.rewardInfos || [])
      .map((ri: any) => ri?.tokenMint?.toBase58?.())
      .filter(Boolean)
    return [mintA, mintB, ...(rewardMints as string[])]
  }, [poolInfo, data?.computePoolInfo])

  const { data: priceMap } = useBirdeyeTokenPrice({ mintList: tokenMints, enabled: chainId === NonEVMChainId.SOLANA })

  const rowsDisplay: SolanaPositionRow[] = useMemo(() => {
    return (
      data?.tableBase?.map((base) => {
        const { amountA, amountB } = base.raw
        const amountADec = Number(amountA.toString()) / 10 ** poolInfo.token0.decimals
        const amountBDec = Number(amountB.toString()) / 10 ** poolInfo.token1.decimals

        // Compute price range from ticks (token0/token1 orientation)
        const { tickLower } = base.data
        const { tickUpper } = base.data
        let minPriceStr = '0'
        let maxPriceStr = '∞'
        try {
          if (tickLower > MIN_TICK) {
            const sqrtLower = SolSqrtPriceMath.getSqrtPriceX64FromTick(tickLower)
            const minPrice = SolSqrtPriceMath.sqrtPriceX64ToPrice(
              sqrtLower,
              poolInfo.token0.decimals,
              poolInfo.token1.decimals,
            )
            minPriceStr = minPrice.toString()
          }
          if (tickUpper < MAX_TICK) {
            const sqrtUpper = SolSqrtPriceMath.getSqrtPriceX64FromTick(tickUpper)
            const maxPrice = SolSqrtPriceMath.sqrtPriceX64ToPrice(
              sqrtUpper,
              poolInfo.token0.decimals,
              poolInfo.token1.decimals,
            )
            maxPriceStr = maxPrice.toString()
          }
        } catch (e) {
          // keep defaults on failure
        }
        // Current price from pool data
        const currentPriceNum = data?.computePoolInfo?.currentPrice?.toNumber?.() ?? undefined
        const showPercentages =
          currentPriceNum && Number.isFinite(currentPriceNum) && minPriceStr !== '0' && maxPriceStr !== '∞'
        let minPct = ''
        let maxPct = ''
        let rangePosition = 50
        let outOfRange = false
        if (showPercentages) {
          const minNum = Number(minPriceStr)
          const maxNum = Number(maxPriceStr)
          outOfRange = currentPriceNum! < minNum || currentPriceNum! > maxNum
          minPct = formatPercentage(((minNum - currentPriceNum!) / currentPriceNum!) * 100)
          maxPct = formatPercentage(((maxNum - currentPriceNum!) / currentPriceNum!) * 100)
          rangePosition = Math.max(0, Math.min(100, ((currentPriceNum! - minNum) / (maxNum - minNum)) * 100))
        }

        const mintPrices: Record<string, { value: number }> = {}
        const [mintA, mintB] = [poolInfo.rawPool.mintA.address, poolInfo.rawPool.mintB.address]

        const priceA = mintA ? priceMap?.[mintA]?.value ?? 0 : 0
        const priceB = mintB ? priceMap?.[mintB]?.value ?? 0 : 0

        if (mintA) mintPrices[mintA] = { value: priceA }
        if (mintB) mintPrices[mintB] = { value: priceB }
        ;(data?.computePoolInfo?.rewardInfos || []).forEach((ri: any) => {
          const m = ri?.tokenMint?.toBase58?.()
          if (m) mintPrices[m] = { value: priceMap?.[m]?.value ?? 0 }
        })

        const position = {
          ...base.data,
          token0: poolInfo.token0,
          token1: poolInfo.token1,
          protocol: poolInfo.protocol,
          chainId: poolInfo.chainId,
          status: POSITION_STATUS.ALL,
        }

        const aprRes = base
          ? getPositionAprCore({
              poolInfo: {
                ...poolInfo.rawPool,
                liquidity: poolOnchain ? BigInt(poolOnchain?.computePoolInfo.liquidity.toNumber()) : 0n,
              },
              positionAccount: position,
              mintPrices,
              inRange: !outOfRange,
            })
          : { apr: 0, fee: { apr: 0 }, rewards: [{ apr: 0 }] }

        const display: SolanaPositionRow = {
          tokenId: base.tokenId,
          tableRow: {
            tokenInfo: base.tokenInfo,
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
            earnings: <Text>-</Text>,
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
                <Text>{displayApr(aprRes.apr)}</Text>
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
                showPercentages={Boolean(showPercentages)}
              />
            ),
            actions: (
              <SolanaV3PositionActions
                removed={base.raw.liquidity.isZero()}
                outOfRange={outOfRange}
                chainId={NonEVMChainId.SOLANA}
                poolInfo={poolInfo}
                position={position}
              />
            ),
            tokenId: base.tokenId,
          },
        }

        return display
      }) ?? []
    )
  }, [priceMap, poolInfo, data?.tableBase, data?.computePoolInfo])

  // Simulation-based pending yield per position (follow solana app logic)
  const [earningsUsdMap, setEarningsUsdMap] = useState<Record<string, number>>({})
  const handleEarningsReady = useCallback((tokenId: string, usd: number) => {
    setEarningsUsdMap((prev) => (prev[tokenId] === usd ? prev : { ...prev, [tokenId]: usd }))
  }, [])

  const computed = useMemo(() => {
    const base = data?.baseRows ?? []
    if (!rowsDisplay.length) return { rows: [], totalLiq: 0, totalEarn: 0, totalApr: 0 }
    const solData = poolInfo.rawPool
    const mintA = solData?.mintA?.address
    const mintB = solData?.mintB?.address
    const priceA = mintA ? priceMap?.[mintA]?.value ?? 0 : 0
    const priceB = mintB ? priceMap?.[mintB]?.value ?? 0 : 0
    let totalLiq = 0
    let totalEarn = 0
    let aprWeightedSum = 0
    const rows = rowsDisplay.map((row) => {
      const b = base.find((x) => x.tokenId === row.tokenId)
      if (!b) return row
      const liqUSD = b.amountADec * priceA + b.amountBDec * priceB
      totalLiq += liqUSD
      // Use simulation result for more accurate pending yield
      const earnUSD = earningsUsdMap[row.tokenId] ?? 0
      totalEarn += earnUSD

      aprWeightedSum += row.tableRow.aprValue.apr * liqUSD
      return {
        ...row,
        tableRow: {
          ...row.tableRow,
          earnings: <Text>{formatPoolDetailFiatNumber(earnUSD)}</Text>,
          liquidity: <Text>{formatPoolDetailFiatNumber(liqUSD)}</Text>,
        },
      }
    })
    const totalApr = totalLiq > 0 ? aprWeightedSum / totalLiq : 0
    return { rows, totalLiq, totalEarn, totalApr }
  }, [data, priceMap, poolInfo, rowsDisplay, earningsUsdMap])

  if (isLoading) return <LoadingCard />
  if (!computed.rows.length) return <EmptyPositionCard />

  return (
    <>
      {/* hidden probes to compute earnings via simulation per position */}
      {data?.tableBase?.map((tb) => (
        <SolanaV3EarningsProbe
          key={tb.tokenId}
          tokenId={tb.tokenId}
          poolInfo={poolInfo}
          position={tb.data as any}
          onReady={handleEarningsReady}
        />
      ))}

      <PositionsTable
        poolInfo={poolInfo as PoolInfo}
        totalLiquidityUSD={computed.totalLiq}
        totalApr={computed.totalApr}
        totalEarnings={formatPoolDetailFiatNumber(computed.totalEarn)}
        data={computed.rows.map((r) => r.tableRow)}
        onlyFarmHarvest={false}
        harvestAllButton={
          <PrimaryOutlineButton onClick={handleHarvestAll} disabled={sending || !computed.totalEarn}>
            {sending ? t('Harvesting...') : t('Harvest All')}
          </PrimaryOutlineButton>
        }
      />
    </>
  )
}

// Helper component: uses simulation to compute pending yield and feeds back to parent
// todo:@eric
const SolanaV3EarningsProbe: FC<{
  tokenId: string
  poolInfo: SolanaV3PoolInfo
  position: any
  onReady: (tokenId: string, usd: number) => void
}> = ({ tokenId, poolInfo, position, onReady }) => {
  const { totalPendingYield } = useSolanaV3RewardInfoFromSimulation({ poolInfo, position })
  useEffect(() => {
    const v = Number(totalPendingYield?.toString?.() ?? 0)
    if (Number.isFinite(v)) onReady(tokenId, v)
  }, [tokenId, totalPendingYield, onReady])
  return null
}
