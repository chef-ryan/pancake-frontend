import { styled } from 'styled-components'
import { useTranslation } from '@pancakeswap/localization'
import { Text, RowBetween, RowFixed, AutoColumn, Flex, QuestionHelperV2, SkeletonV2 } from '@pancakeswap/uikit'
import { useUserSlippage } from '@pancakeswap/utils/user'
import { TradeType } from '@pancakeswap/swap-sdk-core'
import { Field } from 'types'
import { BUYBACK_FEE, LP_HOLDERS_FEE, TOTAL_FEE, TREASURY_FEE } from 'config/constants/exchange'
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown } from 'utils/exchange'
import { SlippageButton } from 'components/Buttons/SlippageButton'
import SwapRoute, { AdvancedSwapDetailsProps } from './SwapRoute'
import FormattedPriceImpact from '../FormattedPriceImpact'

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

  const totalFeePercent = `${(TOTAL_FEE * 100).toFixed(2)}%`
  const lpHoldersFeePercent = `${(LP_HOLDERS_FEE * 100).toFixed(2)}%`
  const treasuryFeePercent = `${(TREASURY_FEE * 100).toFixed(4)}%`
  const buyBackFeePercent = `${(BUYBACK_FEE * 100).toFixed(4)}%`

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
                ? `${slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4)} ${trade.outputAmount.currency.symbol}` ??
                  '-'
                : `${slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4)} ${trade.inputAmount.currency.symbol}` ??
                  '-'}
            </DetailsContent>
          </RowFixed>
        </SkeletonV2>
      </RowBetween>
      <RowBetween>
        <RowFixed>
          <QuestionHelperV2
            text={
              <>
                <Text>{t('For each trade a %amount% fee is paid', { amount: totalFeePercent })}</Text>
                <Text>- {t('%amount% to LP token holders', { amount: lpHoldersFeePercent })}</Text>
                <Text>- {t('%amount% to the Treasury', { amount: treasuryFeePercent })}</Text>
                <Text>- {t('%amount% towards CAKE buyback and burn', { amount: buyBackFeePercent })}</Text>
              </>
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

  const showRoute = Boolean(props.trade && props.trade.route.path.length > 1)

  return (
    <AutoColumn gap="8px">
      <TradeSummary {...props} allowedSlippage={allowedSlippage} />
      {showRoute && (
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
      )}
    </AutoColumn>
  )
}
