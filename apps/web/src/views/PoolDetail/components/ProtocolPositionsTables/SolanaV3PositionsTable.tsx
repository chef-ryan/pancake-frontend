import { useMemo, ReactElement, FC } from 'react'
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
import { useQuery } from '@tanstack/react-query'
import { displayApr } from '@pancakeswap/utils/displayApr'
import { useChainIdByQuery } from 'state/info/hooks'
import { Tooltips } from 'components/Tooltips'
import { AprTooltipContent } from 'views/universalFarms/components/PoolAprButtonV3/AprTooltipContent'
import { AprKey, getAprForPriceRange } from 'hooks/solana/useClmmApr'
import { useSolanaOnchainClmmPool } from 'hooks/solana/useSolanaOnchainPool'
import { SolanaV3PositionActions } from 'views/universalFarms/components/PositionActions/SolanaV3PositionActions'
import { POSITION_STATUS } from 'state/farmsV4/state/accountPositions/type'

import { PositionsTable } from './PositionsTable'
import { EmptyPositionCard, LoadingCard } from './UtilityCards'
import { PriceRangeDisplay } from './PriceRangeDisplay'

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
            apr: <Text>-</Text>,
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
                position={{
                  ...base.data,
                  token0: poolInfo.token0,
                  token1: poolInfo.token1,
                  protocol: poolInfo.protocol,
                  chainId: poolInfo.chainId,
                  status: POSITION_STATUS.ALL,
                }}
              />
            ),
            tokenId: base.tokenId,
          },
        }

        return display
      }) ?? []
    )
  }, [poolInfo, data?.tableBase, data?.computePoolInfo])

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
      const earnUSD = b.feeADec * priceA + b.feeBDec * priceB
      totalEarn += earnUSD

      let aprValue = 0
      let feeAprValue = 0
      try {
        const mintPrice: Record<string, { value: number }> = {}
        if (mintA) mintPrice[mintA] = { value: priceA }
        if (mintB) mintPrice[mintB] = { value: priceB }
        ;(data?.computePoolInfo?.rewardInfos || []).forEach((ri: any) => {
          const m = ri?.tokenMint?.toBase58?.()
          if (m) mintPrice[m] = { value: priceMap?.[m]?.value ?? 0 }
        })
        const tb = data?.tableBase?.find((tb) => tb.tokenId === row.tokenId)
        const aprRes = tb
          ? getAprForPriceRange({
              poolInfo: poolInfo.rawPool,
              poolLiquidity: (poolOnchain?.computePoolInfo?.liquidity as BN) ?? new BN(0),
              tickLower: tb.data.tickLower,
              tickUpper: tb.data.tickUpper,
              planType: 'D',
              tokenPrices: priceMap,
              timeBasis: AprKey.Day,
              liquidity: tb.raw.liquidity ?? new BN(1),
            })
          : { apr: 0, fee: { apr: 0 } }
        aprValue = aprRes?.apr || 0
        feeAprValue = aprRes.fee.apr || 0
      } catch (e) {
        console.error(e)
      }
      aprWeightedSum += aprValue * liqUSD
      return {
        ...row,
        tableRow: {
          ...row.tableRow,
          earnings: <Text>{formatPoolDetailFiatNumber(earnUSD)}</Text>,
          liquidity: <Text>{formatPoolDetailFiatNumber(liqUSD)}</Text>,
          apr: (
            <Tooltips content={<AprTooltipContent combinedApr={aprValue} lpFeeApr={feeAprValue} showDesc />}>
              <Text>{displayApr(aprValue)}</Text>
            </Tooltips>
          ),
        },
      }
    })
    const totalApr = totalLiq > 0 ? aprWeightedSum / totalLiq : 0
    return { rows, totalLiq, totalEarn, totalApr }
  }, [poolOnchain?.computePoolInfo?.liquidity, data, priceMap, poolInfo, rowsDisplay])

  if (isLoading) return <LoadingCard />
  if (!computed.rows.length) return <EmptyPositionCard />

  return (
    <PositionsTable
      poolInfo={poolInfo as PoolInfo}
      totalLiquidityUSD={computed.totalLiq}
      totalApr={computed.totalApr}
      totalEarnings={formatPoolDetailFiatNumber(computed.totalEarn)}
      data={computed.rows.map((r) => r.tableRow)}
    />
  )
}
