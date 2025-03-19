import { useTranslation } from '@pancakeswap/localization'
import { TradeType } from '@pancakeswap/swap-sdk-core'
import { AutoColumn, Flex, QuestionHelperV2, RowBetween, RowFixed, SkeletonV2, Text } from '@pancakeswap/uikit'
import { SlippageButton } from 'components/Buttons/SlippageButton'
import { POOL_FEE_DECIMALS } from 'config/constants/formatting'
import { useUserSlippage } from 'hooks/useUserSlippage'
import { useMemo } from 'react'
import { styled } from 'styled-components'
import { formatBalance } from 'ton/utils/formatting'
import { Field } from 'types'
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown } from 'utils/exchange'
import FormattedPriceImpact from '../FormattedPriceImpact'
import { AdvancedSwapDetailsProps, SwapRoute } from './SwapRoute'

const DetailsTitle = styled(Text)`
  text-decoration: underline dotted;
  text-underline-offset: 5px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSubtle};
  line-height: 150%;
  cursor: help;
`
const DetailsContent = styled(Text)`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  line-height: 150%;
`

function TradeSummary({
  trade,
  allowedSlippage,
  isLoading,
}: AdvancedSwapDetailsProps & {
  allowedSlippage: number
}) {
  const { t } = useTranslation()
  const { priceImpactWithoutFee, realizedLPFee } = computeTradePriceBreakdown(trade)
  const isExactIn = trade ? trade.tradeType === TradeType.EXACT_INPUT : true
  const slippageAdjustedAmounts = computeSlippageAdjustedAmounts(trade ?? undefined, allowedSlippage)

  const fees = useMemo(() => {
    if (!trade) return null

    const lpHoldersFee = trade.route.pairs.reduce((acc, pair) => acc + pair.lpFee, 0n)
    const treasuryFee = trade.route.pairs.reduce((acc, pair) => acc + pair.protocolFee, 0n)
    const totalFee = trade.route.pairs.reduce((acc, pair) => acc + pair.lpFee + pair.protocolFee + pair.refFee, 0n)

    return {
      lpHoldersFeePercent: `${formatBalance(lpHoldersFee, POOL_FEE_DECIMALS)}%`,
      treasuryFeePercent: `${formatBalance(treasuryFee, POOL_FEE_DECIMALS)}%`,
      totalFeePercent: `${formatBalance(totalFee, POOL_FEE_DECIMALS)}%`,
    }
  }, [trade])

  return (
    <>
      <RowBetween>
        <RowFixed>
          <QuestionHelperV2
            text={t('The difference between the market price and estimated price due to trade size.')}
            placement="top"
          >
            <DetailsTitle>{t('Price Impact')}</DetailsTitle>
          </QuestionHelperV2>
        </RowFixed>
        <SkeletonV2 width="50px" height="18px" borderRadius="8px" minHeight="auto" isDataReady={!isLoading}>
          <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
        </SkeletonV2>
      </RowBetween>

      <RowBetween>
        <RowFixed>
          <QuestionHelperV2
            text={t(
              'Setting a high slippage tolerance can help transactions succeed, but you may not get such a good price. Use with caution.',
            )}
            placement="top"
          >
            <DetailsTitle>{t('Slippage Tolerance')}</DetailsTitle>
          </QuestionHelperV2>
        </RowFixed>
        <SlippageButton />
      </RowBetween>

      <RowBetween>
        <RowFixed>
          <QuestionHelperV2
            text={t(
              'Your transaction will revert if there is a large, unfavorable price movement before it is confirmed.',
            )}
            placement="top"
          >
            <DetailsTitle>{isExactIn ? t('Minimum received') : t('Maximum sold')}</DetailsTitle>
          </QuestionHelperV2>
        </RowFixed>

        <SkeletonV2 width="50px" height="18px" borderRadius="8px" minHeight="auto" isDataReady={!isLoading}>
          <RowFixed>
            <DetailsContent>
              {!trade
                ? '-'
                : isExactIn
                ? `${slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4) ?? '-'} ${
                    trade.outputAmount.currency.symbol
                  }`
                : `${slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4) ?? '-'} ${
                    trade.inputAmount.currency.symbol
                  }`}
            </DetailsContent>
          </RowFixed>
        </SkeletonV2>
      </RowBetween>
      <RowBetween>
        <RowFixed>
          <QuestionHelperV2
            text={
              fees && (
                <>
                  <Text>{t('For each trade a %amount% fee is paid', { amount: fees.totalFeePercent })}</Text>
                  <Text>- {t('%amount% to LP token holders', { amount: fees.lpHoldersFeePercent })}</Text>
                  <Text>- {t('%amount% to the Treasury', { amount: fees.treasuryFeePercent })}</Text>
                  {/* <Text>- {t('%amount% towards CAKE buyback and burn', { amount: buyBackFeePercent })}</Text> */}
                </>
              )
            }
            placement="top"
          >
            <DetailsTitle>{t('Trading Fee')}</DetailsTitle>
          </QuestionHelperV2>
        </RowFixed>
        <SkeletonV2 width="50px" height="18px" borderRadius="8px" minHeight="auto" isDataReady={!isLoading}>
          <DetailsContent>
            {realizedLPFee && trade ? `${realizedLPFee.toSignificant(4)} ${trade.inputAmount.currency.symbol}` : '-'}
          </DetailsContent>
        </SkeletonV2>
      </RowBetween>
    </>
  )
}

export function AdvancedSwapDetails(props: AdvancedSwapDetailsProps) {
  const { t } = useTranslation()
  const [allowedSlippage] = useUserSlippage()

  return (
    <AutoColumn gap="8px">
      <TradeSummary {...props} allowedSlippage={allowedSlippage} />
      <RowBetween>
        <RowFixed>
          <Flex alignItems="center">
            <QuestionHelperV2
              text={t('Routing through these tokens resulted in the best price for your trade.')}
              placement="top"
            >
              <DetailsTitle>{t('Route')}</DetailsTitle>
            </QuestionHelperV2>
          </Flex>
        </RowFixed>
        <RowFixed>
          <SkeletonV2 width="50px" height="18px" borderRadius="8px" minHeight="auto" isDataReady={!props.isLoading}>
            <SwapRoute {...props} />
          </SkeletonV2>
        </RowFixed>
      </RowBetween>
    </AutoColumn>
  )
}
