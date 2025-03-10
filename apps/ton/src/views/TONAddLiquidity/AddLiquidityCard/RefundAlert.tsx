import { useTranslation } from '@pancakeswap/localization'
import { Currency } from '@pancakeswap/ton-v2-sdk'
import { Box, Button, Flex, FlexGap, Message, Text } from '@pancakeswap/uikit'
import { CurrencyLogo } from 'components/widgets'
import { NumberDisplay } from 'components/widgets/NumberDisplay'
import { MAXIMUM_SIGNIFICANT_DIGITS } from 'config/constants/exchange'
import { useCurrencyOrder } from 'hooks/tokens/useCurrencyOrder'
import { useAtomValue } from 'jotai'
import { useMemo } from 'react'
import { lpAccountMultipleQueryAtom } from 'ton/atom/liquidity/lpAccountMultipleQueryAtom'
import { useLiquidityRefund } from 'ton/logic/liquidity/useLiquidityRefund'
import { formatBalance } from 'ton/utils/formatting'

interface RefundAlertProps {
  currency0?: Currency
  currency1?: Currency
  poolAddress: string
}
export const RefundAlert = ({ poolAddress, currency0: currency0_, currency1: currency1_ }: RefundAlertProps) => {
  const { t } = useTranslation()
  const { data, isFetching } = useAtomValue(lpAccountMultipleQueryAtom([poolAddress]))

  const lpAccount = useMemo(() => data[0], [data])

  const { currency0, currency1 } = useCurrencyOrder({
    currency0_,
    currency1_,
  })

  const { refund } = useLiquidityRefund({
    lpAccountAddress: lpAccount?.lpAccountAddress,
    currency0,
    currency1,
  })

  if (!lpAccount || !currency0 || !currency1 || (!isFetching && lpAccount.amount0 === 0n && lpAccount.amount1 === 0n))
    return null

  return (
    <>
      <Message variant="primary">
        <Box>
          <Text small>
            {t(
              'Unclaimed refunds may be used up while adding liquidity to this pool. You can choose to claim them now.',
            )}
          </Text>
          <FlexGap mt="16px" gap="16px" flexDirection="column">
            <Flex justifyContent="space-between">
              <FlexGap gap="8px">
                <CurrencyLogo currency={currency0} size="18px" />
                <Text small>{currency0?.symbol}</Text>
              </FlexGap>
              <NumberDisplay
                value={formatBalance(lpAccount.amount0, currency0?.decimals)}
                maximumSignificantDigits={MAXIMUM_SIGNIFICANT_DIGITS}
                fontSize="14px"
              />
            </Flex>
            <Flex justifyContent="space-between">
              <FlexGap gap="8px">
                <CurrencyLogo currency={currency1} size="18px" />
                <Text small>{currency1?.symbol}</Text>
              </FlexGap>
              <NumberDisplay
                value={formatBalance(lpAccount.amount1, currency1?.decimals)}
                maximumSignificantDigits={MAXIMUM_SIGNIFICANT_DIGITS}
                fontSize="14px"
              />
            </Flex>

            <Button onClick={refund} scale="xs" variant="text" width="fit-content" ml="auto">
              <Text color="primary60" bold small>
                {t('Claim Refund')}
              </Text>
            </Button>
          </FlexGap>
        </Box>
      </Message>
    </>
  )
}
