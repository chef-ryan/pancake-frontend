import { useTranslation } from '@pancakeswap/localization'
import { Button, Column, Flex, FlexGap, LoadingDot, PreTitle, Text } from '@pancakeswap/uikit'
import { tokenByAddressQueryAtom } from 'atoms/tokens/tokenByAddressQueryAtom'
import { LightCard } from 'components/Card'
import { CurrencyLogo, DoubleCurrencyLogo } from 'components/widgets'
import { useUserRefundPools } from 'hooks/liquidity/useUserRefundPools'
import { useAtomValue } from 'jotai'
import { useCallback } from 'react'
import { ScrollableList } from 'styles'
import { useLiquidityRefund } from 'ton/logic/liquidity/useLiquidityRefund'
import { formatBigNumber } from 'ton/utils/formatting'
import { RefundPool } from 'types/pools'
import { getAssetUrl } from 'utils'

export const RefundModal = () => {
  const { t } = useTranslation()
  const { refundPools, isFetching } = useUserRefundPools()

  return (
    <FlexGap gap="16px" flexDirection="column">
      <PreTitle>{t('Pools and Refunds')}</PreTitle>

      {refundPools.length === 0 ? (
        <FlexGap my="24px" gap="8px" flexDirection="column" alignItems="center">
          <img src={getAssetUrl('laptop-bunny.png')} alt="laptop bunny" width="128px" />
          <Text color="textSubtle">{isFetching ? <LoadingDot /> : t('No leftover tokens to refund')}</Text>
        </FlexGap>
      ) : (
        <ScrollableList px="2px" maxHeight={[null, null, null, '300px']}>
          {refundPools.map((pool) => (
            <PoolRefundRow
              key={pool.poolAddress}
              token0={pool.token0}
              token1={pool.token1}
              refundAmount0={pool.refundAmount0}
              refundAmount1={pool.refundAmount1}
              lpAccountAddress={pool.lpAccountAddress}
            />
          ))}
        </ScrollableList>
      )}
    </FlexGap>
  )
}

const PoolRefundRow = ({
  token0,
  token1,
  refundAmount0,
  refundAmount1,
  lpAccountAddress,
}: Omit<RefundPool, 'poolAddress'>) => {
  const { t } = useTranslation()

  const { data: currency0 } = useAtomValue(tokenByAddressQueryAtom(token0))
  const { data: currency1 } = useAtomValue(tokenByAddressQueryAtom(token1))

  const { refund } = useLiquidityRefund({ lpAccountAddress, currency0, currency1 })

  const handleRefund = useCallback(() => {
    refund()
  }, [refund])

  return (
    <LightCard padding="16px">
      <Column gap="16px">
        <FlexGap gap="8px">
          <DoubleCurrencyLogo currency0={currency0} currency1={currency1} overlap />
          <Text bold>
            {currency0?.symbol}-{currency1?.symbol}
          </Text>
        </FlexGap>

        <Text color="textSubtle" textTransform="uppercase" fontSize="12px" bold>
          {t('Refundable')}
        </Text>
        <FlexGap gap="16px" flexDirection="column">
          <Flex justifyContent="space-between">
            <FlexGap gap="8px">
              <CurrencyLogo currency={currency0} />
              <Text>{currency0?.symbol}</Text>
            </FlexGap>
            <Text>{formatBigNumber(refundAmount0, currency0?.decimals)}</Text>
          </Flex>
          <Flex justifyContent="space-between">
            <FlexGap gap="8px">
              <CurrencyLogo currency={currency1} />
              <Text>{currency1?.symbol}</Text>
            </FlexGap>
            <Text>{formatBigNumber(refundAmount1, currency1?.decimals)}</Text>
          </Flex>

          <Button onClick={handleRefund}>{t('Refund')}</Button>
        </FlexGap>
      </Column>
    </LightCard>
  )
}
