import { useTranslation } from '@pancakeswap/localization'
import { PriceOrder, SVMTrade } from '@pancakeswap/price-api-sdk'
import { FlexGap, SkeletonV2, Text } from '@pancakeswap/uikit'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import { memo, useMemo } from 'react'
import { isSVMOrder, isXOrder } from 'views/Swap/utils'
import { TradeType } from '@pancakeswap/sdk'
import BigNumber from 'bignumber.js'
import { useSolanaTokenPrices } from 'hooks/solana/useSolanaTokenPrice'
import { useSolanaTokenList } from 'hooks/solana/useSolanaTokenList'
import { TOKEN_WSOL } from '@pancakeswap/solana-core-sdk'
import { formatNumber } from '@pancakeswap/utils/formatNumber'

import { useIsWrapping, useSlippageAdjustedAmounts } from '../../Swap/V3Swap/hooks'
import { useHasDynamicHook } from '../hooks/useHasDynamicHook'
import { usePriceBreakdown } from '../hooks/usePriceBreakdown'

interface TradingFeeProps {
  loaded: boolean
  order?: PriceOrder
}

export const SVMTradingFee = memo(({ routes }: { routes: SVMTrade<TradeType>['routes'] }) => {
  // Collect unique fee mints from all pools
  const uniqueMints = useMemo(() => {
    const mintSet = new Set<string>()
    for (const route of routes ?? []) {
      for (const pool of (route as any)?.pools ?? []) {
        const mint: string | undefined = pool?.feeMintAddress
        if (mint) mintSet.add(String(mint).toLowerCase())
      }
    }
    // Always include wSOL for conversion
    mintSet.add(TOKEN_WSOL.address.toLowerCase())
    return Array.from(mintSet)
  }, [routes])

  const { tokenList } = useSolanaTokenList()
  const tokenMap = useMemo(() => {
    const map = new Map<string, { decimals: number }>()
    for (const t of tokenList) {
      map.set(t.address.toLowerCase(), { decimals: t.decimals })
    }
    return map
  }, [tokenList])

  const { data: priceMap, isLoading } = useSolanaTokenPrices({
    mints: uniqueMints,
    enabled: uniqueMints.length > 0,
  })

  const totalFeeInSol = useMemo(() => {
    if (!routes || !priceMap) return undefined
    const wsolMintLower = TOKEN_WSOL.address.toLowerCase()
    const solUsd = priceMap[wsolMintLower]
    let sum = new BigNumber(0)
    let hadMissing = false

    for (const route of routes) {
      const pools: any[] = (route as any)?.pools ?? []
      for (const pool of pools) {
        const feeAmountRaw: string | undefined = pool?.feeAmount
        const feeMint: string | undefined = pool?.feeMintAddress
        if (!feeAmountRaw || !feeMint) continue
        const mintLower = String(feeMint).toLowerCase()
        const meta = tokenMap.get(mintLower)
        const decimals = meta?.decimals
        if (decimals === undefined) {
          hadMissing = true
          continue
        }
        const humanAmount = new BigNumber(feeAmountRaw).div(new BigNumber(10).pow(decimals))

        if (mintLower === wsolMintLower) {
          sum = sum.plus(humanAmount)
          continue
        }

        const tokenUsd = priceMap[mintLower]
        if (tokenUsd === undefined || solUsd === undefined || solUsd === 0) {
          hadMissing = true
          continue
        }
        const feeInSol = humanAmount.multipliedBy(tokenUsd).dividedBy(solUsd)
        sum = sum.plus(feeInSol)
      }
    }

    return { value: sum.toNumber(), approximate: hadMissing }
  }, [priceMap, routes, tokenMap])

  const display = useMemo(() => {
    if (!totalFeeInSol) return null
    const prefix = totalFeeInSol.approximate ? '~' : ''
    return `${prefix}${formatNumber(totalFeeInSol.value, { maxDecimalDisplayDigits: 6 })} SOL`
  }, [totalFeeInSol])

  return (
    <SkeletonV2 width="100px" height="16px" borderRadius="8px" minHeight="auto" isDataReady={!isLoading}>
      <Text color="textSubtle" fontSize="14px">
        {display ?? '-'}
      </Text>
    </SkeletonV2>
  )
})

export const TradingFee: React.FC<TradingFeeProps> = memo(({ order, loaded }) => {
  const { t } = useTranslation()
  const slippageAdjustedAmounts = useSlippageAdjustedAmounts(order)

  const priceBreakdown = usePriceBreakdown(order)

  const hasDynamicHooks = useHasDynamicHook(order)
  const isWrapping = useIsWrapping()

  if (Array.isArray(priceBreakdown)) {
    return null
  }

  if (isWrapping || !order || !order.trade || !slippageAdjustedAmounts) {
    return null
  }

  const { lpFeeAmount } = priceBreakdown

  const { inputAmount } = order.trade

  return (
    <FlexGap gap="8px" alignItems="center">
      <Text color="textSubtle" fontSize="14px">
        {t('Fee')}
      </Text>
      <SkeletonV2 width="108px" height="16px" borderRadius="8px" minHeight="auto" isDataReady={loaded}>
        {isSVMOrder(order) ? (
          <SVMTradingFee routes={order.trade.routes} />
        ) : isXOrder(order) ? (
          <Text color="primary" fontSize="14px">
            0 {inputAmount?.currency?.symbol}
          </Text>
        ) : (
          <Text color="textSubtle" fontSize="14px">{`${hasDynamicHooks ? '~' : ''}${formatAmount(lpFeeAmount, 4)} ${
            inputAmount?.currency?.symbol
          }`}</Text>
        )}
      </SkeletonV2>
    </FlexGap>
  )
})
