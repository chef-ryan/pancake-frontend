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
import { SOLANA_NATIVE_TOKEN_ADDRESS } from 'quoter/consts'

import { useIsWrapping, useSlippageAdjustedAmounts } from '../../Swap/V3Swap/hooks'
import { useHasDynamicHook } from '../hooks/useHasDynamicHook'
import { usePriceBreakdown } from '../hooks/usePriceBreakdown'

interface TradingFeeProps {
  loaded: boolean
  order?: PriceOrder
}

export const SVMTradingFee = memo(
  ({ routes, inputCurrencySymbol }: { routes: SVMTrade<TradeType>['routes']; inputCurrencySymbol: string }) => {
    const allPools = useMemo(() => {
      return routes.flatMap((route) => (route as any)?.pools ?? [])
    }, [routes])

    // Collect unique fee mints from all pools
    const uniqueMints = useMemo(() => {
      const mintSet = new Set<string>()
      for (const pool of allPools) {
        let mint: string | undefined = pool?.feeMintAddress

        // if mint === SOLANA_NATIVE_TOKEN_ADDRESS, convert to WSOL
        // because price api only support WSOL
        if (mint === SOLANA_NATIVE_TOKEN_ADDRESS) {
          mint = TOKEN_WSOL.address
        }

        if (mint) mintSet.add(String(mint).toLowerCase())
      }

      return Array.from(mintSet)
    }, [allPools])

    // Input currency Address is the first token in the first pool in the first route
    const inputCurrencyAddress = uniqueMints?.length ? uniqueMints[0] : ''

    const { data: priceMap, isLoading } = useSolanaTokenPrices({
      mints: uniqueMints,
      enabled: uniqueMints.length > 0,
    })

    const { tokenList } = useSolanaTokenList()

    // Only map tokens that we actually need (those in uniqueMints)
    const tokenMap = useMemo(() => {
      const map = new Map<string, { decimals: number }>()
      const uniqueMintsSet = new Set(uniqueMints.map((mint) => mint.toLowerCase()))

      for (const token of tokenList) {
        // Early exit if we've found all tokens we need
        if (uniqueMintsSet.size === 0) break

        const tokenAddressLower = token.address.toLowerCase()
        if (uniqueMintsSet.has(tokenAddressLower)) {
          map.set(tokenAddressLower, { decimals: token.decimals })
          uniqueMintsSet.delete(tokenAddressLower) // Remove from set once found
        }
      }
      return map
    }, [tokenList, uniqueMints])

    const totalFeeInInputCurrency = useMemo(() => {
      if (!allPools?.length || !priceMap) return undefined
      const inputMintLower = inputCurrencyAddress.toLowerCase()
      const inputUsd = priceMap[inputMintLower]

      if (inputUsd === undefined || inputUsd === 0) return undefined

      let totalUsdValue = new BigNumber(0)

      // 1. Sum all USD value of all fee mints
      for (const pool of allPools) {
        const feeAmountRaw: string | undefined = pool?.feeAmount
        const feeMint: string | undefined = pool?.feeMintAddress
        if (!feeAmountRaw || !feeMint) continue

        const mintLower = String(feeMint).toLowerCase()

        const meta = tokenMap.get(mintLower)
        const decimals = meta?.decimals
        if (decimals === undefined) {
          continue
        }

        const humanAmount = new BigNumber(feeAmountRaw).div(new BigNumber(10).pow(decimals))
        const tokenUsd = priceMap[mintLower]
        if (tokenUsd === undefined) {
          continue
        }

        totalUsdValue = totalUsdValue.plus(humanAmount.multipliedBy(tokenUsd))
      }

      // 2. Convert USD sum to input currency
      const totalFeeInInputCurrency = totalUsdValue.dividedBy(inputUsd)

      return { value: totalFeeInInputCurrency.toNumber() }
    }, [priceMap, allPools, inputCurrencyAddress, tokenMap])

    const display = useMemo(() => {
      if (!totalFeeInInputCurrency) return null
      const prefix = '~'
      return `${prefix}${formatNumber(totalFeeInInputCurrency.value, {
        maxDecimalDisplayDigits: 6,
      })} ${inputCurrencySymbol}`
    }, [totalFeeInInputCurrency, inputCurrencySymbol])

    return (
      <SkeletonV2 width="100px" height="16px" borderRadius="8px" minHeight="auto" isDataReady={!isLoading}>
        <Text color="textSubtle" fontSize="14px">
          {display ?? '-'}
        </Text>
      </SkeletonV2>
    )
  },
)

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
        {isSVMOrder(order) && inputAmount?.currency?.symbol ? (
          <SVMTradingFee routes={order.trade.routes} inputCurrencySymbol={inputAmount.currency.symbol} />
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
