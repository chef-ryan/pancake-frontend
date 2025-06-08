import { useTranslation } from '@pancakeswap/localization'
import { Token } from '@pancakeswap/sdk'
import { Box, FlexGap, Text } from '@pancakeswap/uikit'

import { NetworkFilter, TokenFilter, toTokenValue } from '@pancakeswap/widgets-internal'
import { BalanceData } from 'hooks/useAddressBalance'
import { useCallback, useMemo, useState } from 'react'
import { useAllChainsOpts } from 'views/universalFarms/hooks/useMultiChains'
import { ActionButton } from './ActionButton'
import { AssetsList } from './AssetsList'
import { SendAssetForm } from './SendAssetForm'

interface SendAssetsProps {
  assets: BalanceData[]
  isLoading: boolean
  onDismiss: () => void
}

// Convert balances to Asset type for AssetsList component

export const SendAssets: React.FC<SendAssetsProps> = ({ assets, isLoading, onDismiss }) => {
  const [selectedTokens, setSelectedTokens] = useState<string[]>([])
  const [selectedNetworks, setSelectedNetworks] = useState<number[]>([])
  const [selectedAsset, setSelectedAsset] = useState<BalanceData | null>(null)
  const { t } = useTranslation()

  const convertBalancesToAssets = useCallback((balanceItems): BalanceData[] => {
    return balanceItems.map((item) => ({
      id: item.id,
      chainId: item.chainId,
      token: item.token,
      quantity: item.quantity,
      price:
        item.price && item.price.totalUsd !== null
          ? { totalUsd: item.price.totalUsd || 0, usd: item.price.usd, usd24h: item.price.usd24h }
          : undefined,
    }))
  }, [])

  // Get unique networks from assets
  const allChainsOpts = useAllChainsOpts()
  const networkFilterData = useMemo(() => {
    if (assets.length === 0) return []
    const uniqueChain = [...new Set(assets.map((asset) => asset.chainId))]
    return allChainsOpts.filter((chain) => uniqueChain.includes(chain.value))
  }, [assets])

  const tokenFilterData = useMemo(() => {
    if (assets.length === 0) return []

    return assets.map((asset) => {
      return new Token(
        asset.chainId,
        asset.token.address as `0x${string}`,
        asset.token.decimals,
        asset.token.symbol,
        asset.token.name,
      )
    })
  }, [assets])

  const filteredTokens = useMemo(() => {
    // First filter by networks if any are selected
    const networkFilteredBalances =
      selectedNetworks.length === 0 ? assets : assets.filter((asset) => selectedNetworks.includes(asset.chainId))

    // Then filter by tokens if any are selected
    const tokenFilteredBalances =
      selectedTokens.length === 0
        ? networkFilteredBalances
        : networkFilteredBalances.filter((asset) => {
            const tokenValue = toTokenValue({
              chainId: asset.chainId,
              address: asset.token.address as `0x${string}`,
            })
            return selectedTokens.includes(tokenValue)
          })

    return convertBalancesToAssets(tokenFilteredBalances)
  }, [assets, selectedNetworks, selectedTokens, convertBalancesToAssets])
  if (selectedAsset) return <SendAssetForm asset={selectedAsset} onDismiss={() => setSelectedAsset(null)} />
  return (
    <>
      <Text fontSize="20px" fontWeight="bold" mb="16px">
        {t('Send Assets')}
      </Text>
      <FlexGap gap="16px" flexDirection="column" mb="16px">
        <Box>
          <NetworkFilter
            data={allChainsOpts}
            value={selectedNetworks}
            onChange={(value) => setSelectedNetworks(value)}
            multiple
          />
        </Box>
        <Box>
          <TokenFilter
            data={tokenFilterData}
            value={selectedTokens}
            onChange={(e) => setSelectedTokens(e.value)}
            multiple
          />
        </Box>
      </FlexGap>
      <AssetsList assets={filteredTokens} isLoading={isLoading} onRowClick={(asset) => setSelectedAsset(asset)} />
      <FlexGap gap="16px" mt="16px">
        <ActionButton
          onClick={() => {
            onDismiss()
          }}
          variant="tertiary"
        >
          {t('Cancel')}
        </ActionButton>
      </FlexGap>
    </>
  )
}
