import { useTranslation } from '@pancakeswap/localization'
import { Percent } from '@pancakeswap/swap-sdk-core'
import { Box, Grid, IColumnsType, ITableViewProps, Skeleton, Text, useMatchBreakpoints } from '@pancakeswap/uikit'
import { FeeTierTooltip, FiatNumberDisplay, Liquidity, TokenOverview } from '@pancakeswap/widgets-internal'
import { InfinityFeeTierBreakdownWithPool } from 'components/FeeTierBreakdown'
import { TokenPairLogo } from 'components/TokenImage'
import { useMemo } from 'react'
import { getHookByAddress } from 'utils/getHookByAddress'
import { isInfinityProtocol } from 'utils/protocols'
import { Address } from 'viem'

import { InfinityBinPool, InfinityClPool } from '@pancakeswap/smart-router'
import { FarmInfo, farmToPoolInfo, getFarmTokens } from 'edge/farm/farm.util'
import { getCurrencySymbol } from 'utils/getTokenAlias'
import { getChainFullName } from '../utils'
import { RewardStatusDisplay } from './FarmStatusDisplay'
import { checkHasReward } from './FarmStatusDisplay/hooks'
import { PoolGlobalAprButtonV2 } from './PoolAprButtonV2/PoolGlobalAprButtonV2'
import { PoolListItemAction } from './PoolListItemAction'

export const FeeTierComponent = ({ farm }: { farm: FarmInfo }) => {
  const { protocol, pool, chainId, feeTier: fee, feeTierBase } = farm
  const percent = useMemo(() => new Percent(fee ?? 0, feeTierBase || 1), [fee])
  if (isInfinityProtocol(protocol)) {
    return (
      <InfinityFeeTierBreakdownWithPool
        chainId={chainId}
        pool={pool as InfinityClPool | InfinityBinPool}
        infoIconVisible={false}
      />
    )
  }

  return <FeeTierTooltip type={farm.protocol} percent={percent} dynamic={false} />
}

export const useAPRConfig = () => {
  const { t } = useTranslation()
  return useMemo(
    () =>
      ({
        title: t('APR'),
        dataIndex: 'lpApr',
        key: 'apr',
        minWidth: '160px',
        render: (value, info) =>
          value ? (
            <Box style={{ maxWidth: '220px', overflow: 'hidden' }}>
              <PoolGlobalAprButtonV2
                pool={farmToPoolInfo(info)}
                lpApr={info.lpApr}
                merklApr={info.merklApr}
                cakeApr={info.cakeApr}
              />
            </Box>
          ) : (
            <Skeleton width={60} />
          ),
      } as IColumnsType<FarmInfo>),
    [t],
  )
}

export const useFeeConfig = () => {
  const { t } = useTranslation()
  return useMemo(
    () =>
      ({
        title: t('Fee Tier'),
        dataIndex: 'feeTier',
        key: 'feeTier',
        render: (fee, item) => <FeeTierComponent farm={item} />,
      } as IColumnsType<FarmInfo>),
    [t],
  )
}

export const useVol24Config = () => {
  const { t } = useTranslation()
  return useMemo(
    () =>
      ({
        title: t('Volume 24H'),
        dataIndex: 'vol24hUsd',
        key: 'vol',
        minWidth: '125px',
        render: (value) =>
          value ? <FiatNumberDisplay value={value} showFullDigitsTooltip={false} /> : <Skeleton width={60} />,
      } as IColumnsType<FarmInfo>),
    [t],
  )
}

export const useTVLConfig = () => {
  const { t } = useTranslation()
  return useMemo(
    () =>
      ({
        title: t('TVL'),
        dataIndex: 'tvlUsd',
        key: 'tvl',
        minWidth: '125px',
        render: (value) =>
          value ? <FiatNumberDisplay value={value} showFullDigitsTooltip={false} /> : <Skeleton width={60} />,
      } as IColumnsType<FarmInfo>),
    [t],
  )
}

export const usePoolTypeConfig = () => {
  const { t } = useTranslation()
  return useMemo(
    () =>
      ({
        title: t('pool type'),
        dataIndex: 'protocol',
        key: 'protocol',
        render: (value) => (
          <Box style={{ width: 'max-content' }}>
            <Liquidity.PoolFeaturesBadge showPoolType showLabel={false} poolType={value} short />
          </Box>
        ),
      } as IColumnsType<FarmInfo>),
    [t],
  )
}

export const usePoolFeatureConfig = (showPoolType = true) => {
  const { t } = useTranslation()
  return useMemo(
    () =>
      ({
        title: t('Pool Feature'),
        dataIndex: 'hookAddress',
        key: 'hookAddress',
        minWidth: '140px',
        render: (value: Address, item: FarmInfo) => {
          const hookData = getHookByAddress(item.chainId, value)
          return (
            <Grid gridGap="4px">
              {hookData ? (
                <Liquidity.PoolFeaturesBadge showPoolType={showPoolType} showLabel={false} hookData={hookData} />
              ) : showPoolType ? (
                <Liquidity.PoolFeaturesBadge showPoolType showLabel={false} poolType={item.protocol} />
              ) : (
                <Text color="textSubtle" textAlign="center">
                  -
                </Text>
              )}
            </Grid>
          )
        },
      } as unknown as IColumnsType<FarmInfo>),
    [t, showPoolType],
  )
}

export const PoolTokenOverview = ({ data }: { data: FarmInfo }) => {
  const showReward = checkHasReward(data.chainId, data.id)

  const [token0, token1] = getFarmTokens(data)
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <TokenOverview
        isReady
        token={token0}
        quoteToken={token1}
        iconWidth="48px"
        getChainName={getChainFullName}
        getCurrencySymbol={getCurrencySymbol}
        icon={<TokenPairLogo width={44} height={44} variant="inverted" primaryToken={token0} secondaryToken={token1} />}
      />
      {showReward && <RewardStatusDisplay />}
    </div>
  )
}

export const useColumnConfig = <T extends FarmInfo = FarmInfo>(): ITableViewProps<T>['columns'] => {
  const { t } = useTranslation()
  const mediaQueries = useMatchBreakpoints()
  const vol24hUsdConf = useVol24Config()
  const TVLUsdConf = useTVLConfig()
  const feeTierConf = useFeeConfig()
  const APRConf = useAPRConfig()
  const poolTypeConf = usePoolTypeConfig()
  const poolFeatureConf = usePoolFeatureConfig(false)

  return useMemo(
    () => [
      {
        title: t('All Pools'),
        dataIndex: null,
        key: 'name',
        minWidth: '210px',
        render: (_, item) => <PoolTokenOverview data={item} />,
      },
      {
        ...feeTierConf,
        display: mediaQueries.isXl || mediaQueries.isXxl,
      },
      {
        ...APRConf,
        sorter: true,
      },
      {
        ...TVLUsdConf,
        sorter: true,
        display: mediaQueries.isXl || mediaQueries.isXxl,
      },
      {
        ...vol24hUsdConf,
        sorter: true,
        display: mediaQueries.isXl || mediaQueries.isXxl || mediaQueries.isLg,
      },
      {
        ...poolTypeConf,
        display: mediaQueries.isXxl,
      },
      {
        ...poolFeatureConf,
        display: mediaQueries.isXxl,
      },
      {
        title: '',
        render: (value) => <PoolListItemAction pool={value} />,
        dataIndex: null,
        key: 'action',
        clickable: false,
      },
    ],
    [t, mediaQueries, APRConf, feeTierConf, vol24hUsdConf, TVLUsdConf, poolFeatureConf, poolTypeConf],
  )
}

export const useColumnMobileConfig = (): ITableViewProps<FarmInfo>['columns'] => {
  const vol24hUsdConf = useVol24Config()
  const TVLUsdConf = useTVLConfig()
  const feeTierConf = useFeeConfig()
  const APRConf = useAPRConfig()
  const poolTypeConf = usePoolTypeConfig()
  const poolFeatureConf = usePoolFeatureConfig(false)
  return useMemo(
    () => [APRConf, feeTierConf, TVLUsdConf, vol24hUsdConf, poolTypeConf, poolFeatureConf],
    [APRConf, feeTierConf, vol24hUsdConf, TVLUsdConf, poolTypeConf, poolFeatureConf],
  )
}
