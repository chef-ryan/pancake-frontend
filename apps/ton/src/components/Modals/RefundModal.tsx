import { useTranslation } from '@pancakeswap/localization'
import { Button, Flex, FlexGap, Text } from '@pancakeswap/uikit'
import { tokenByAddressQueryAtom } from 'atoms/tokens/tokenByAddressQueryAtom'
import { Card } from 'components/Card'
import { CurrencyLogo, DoubleCurrencyLogo } from 'components/widgets'
import { useUserRefundPools } from 'hooks/liquidity/useUserRefundPools'
import { useAtomValue } from 'jotai'
import { useCallback } from 'react'
import { useLiquidityRefund } from 'ton/logic/liquidity/useLiquidityRefund'
import { formatBalance } from 'ton/utils/formatting'

export const RefundModal = () => {
  const { t } = useTranslation()
  const { poolsWithRefunds } = useUserRefundPools()

  return (
    <FlexGap gap="8px" flexDirection="column">
      <Text color="secondary" textTransform="uppercase" small bold>
        {t('Pools and Refunds')}
      </Text>

      {poolsWithRefunds.length === 0 ? (
        <FlexGap my="24px" gap="8px" flexDirection="column" alignItems="center">
          <img src="/images/laptop-bunny.png" alt="laptop bunny" width="128px" />
          <Text>{t('No leftover tokens to refund')}</Text>
        </FlexGap>
      ) : (
        <>
          {poolsWithRefunds.map((pool) => (
            <PoolRefundRow
              key={pool.poolAddress}
              token0={pool.token0}
              token1={pool.token1}
              refundAmount0={pool.refundAmount0}
              refundAmount1={pool.refundAmount1}
              lpAccountAddress={pool.lpAccountAddress}
            />
          ))}
        </>
      )}
    </FlexGap>
  )
}

interface PoolRefundRowProps {
  token0: string
  token1: string
  refundAmount0: bigint
  refundAmount1: bigint
  lpAccountAddress: string
}
const PoolRefundRow = ({ token0, token1, refundAmount0, refundAmount1, lpAccountAddress }: PoolRefundRowProps) => {
  const { t } = useTranslation()

  const { data: currency0 } = useAtomValue(tokenByAddressQueryAtom(token0))
  const { data: currency1 } = useAtomValue(tokenByAddressQueryAtom(token1))

  const { refund } = useLiquidityRefund({ lpAccountAddress, currency0, currency1 })

  const handleRefund = useCallback(() => {
    refund()
  }, [refund])

  return (
    <Card>
      <FlexGap gap="8px">
        <DoubleCurrencyLogo currency0={currency0} currency1={currency1} />
        <Text bold>
          {currency0?.symbol}-{currency1?.symbol}
        </Text>
      </FlexGap>

      <Text mt="16px" color="textSubtle" textTransform="uppercase" small bold>
        {t('Refundable')}
      </Text>
      <FlexGap mt="16px" gap="16px" flexDirection="column">
        <Flex justifyContent="space-between">
          <FlexGap gap="8px">
            <CurrencyLogo currency={currency0} />
            <Text>{currency0?.symbol}</Text>
          </FlexGap>
          <Text>{formatBalance(refundAmount0, currency0?.decimals)}</Text>
        </Flex>
        <Flex justifyContent="space-between">
          <FlexGap gap="8px">
            <CurrencyLogo currency={currency1} />
            <Text>{currency1?.symbol}</Text>
          </FlexGap>
          <Text>{formatBalance(refundAmount1, currency1?.decimals)}</Text>
        </Flex>

        <Button onClick={handleRefund}>{t('Refund')}</Button>
      </FlexGap>
    </Card>
  )
}
