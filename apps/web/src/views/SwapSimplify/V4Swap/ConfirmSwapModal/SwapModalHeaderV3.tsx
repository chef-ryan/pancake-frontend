import { getChainName } from '@pancakeswap/chains'
import { useTranslation } from '@pancakeswap/localization'
import { Currency, CurrencyAmount, Percent, TradeType } from '@pancakeswap/sdk'
import { ArrowForwardIcon, AutoColumn, Button, ErrorIcon, Row, Text } from '@pancakeswap/uikit'
import { formatAmount } from '@pancakeswap/utils/formatFractions'
import truncateHash from '@pancakeswap/utils/truncateHash'
import { CurrencyLogo } from '@pancakeswap/widgets-internal'
import { RowBetween, RowFixed } from 'components/Layout/Row'
import { chainNameConverter } from 'utils/chainNameConverter'

import { warningSeverity } from 'utils/exchange'
import { chains } from 'utils/wagmi'
import { SwapShowAcceptChanges } from 'views/Swap/components/styleds'

export default function SwapModalHeaderV3({
  inputAmount,
  outputAmount,
  tradeType,
  currencyBalances,
  priceImpactWithoutFee,
  isEnoughInputBalance,
  recipient,
  showAcceptChanges,
  onAcceptChanges,
}: {
  inputAmount: CurrencyAmount<Currency>
  outputAmount: CurrencyAmount<Currency>
  currencyBalances?: {
    INPUT?: CurrencyAmount<Currency>
    OUTPUT?: CurrencyAmount<Currency>
  }
  tradeType: TradeType
  priceImpactWithoutFee?: Percent
  isEnoughInputBalance?: boolean
  recipient?: string
  showAcceptChanges: boolean
  onAcceptChanges: () => void
}) {
  const { t } = useTranslation()

  const priceImpactSeverity = warningSeverity(priceImpactWithoutFee)

  const displayPrecision = 6

  const inputTextColor =
    showAcceptChanges && tradeType === TradeType.EXACT_OUTPUT && isEnoughInputBalance
      ? 'primary'
      : tradeType === TradeType.EXACT_OUTPUT && !isEnoughInputBalance
      ? 'failure'
      : 'text'

  const truncatedRecipient = recipient ? truncateHash(recipient) : ''

  const recipientInfoText = t('Output will be sent to %recipient%', {
    recipient: truncatedRecipient,
  })

  const [recipientSentToText, postSentToText] = recipientInfoText.split(truncatedRecipient)

  return (
    <AutoColumn gap="md">
      <Row justifyContent="space-around">
        <AutoColumn justify="center">
          <CurrencyLogo currency={inputAmount.currency} size="40px" showChainLogo />

          <Text color={inputTextColor} bold ellipsis>
            {formatAmount(inputAmount, displayPrecision)}&nbsp;
            {inputAmount.currency.symbol}
          </Text>

          <Text color="textSubtle" fontSize="12px" bold>
            {chainNameConverter(
              chains.find((item) => item.id === inputAmount.currency.chainId)?.name ||
                getChainName(inputAmount.currency.chainId),
            )}
          </Text>
        </AutoColumn>
        <RowFixed my="auto">
          <ArrowForwardIcon width="24px" ml="4px" color="textSubtle" />
        </RowFixed>
        <AutoColumn justify="center">
          <CurrencyLogo currency={outputAmount.currency} size="40px" showChainLogo />

          <Text
            bold
            ellipsis
            color={
              priceImpactSeverity > 2
                ? 'failure'
                : showAcceptChanges && tradeType === TradeType.EXACT_INPUT
                ? 'primary'
                : 'text'
            }
          >
            {formatAmount(outputAmount, displayPrecision)}&nbsp;{outputAmount.currency.symbol}
          </Text>

          <Text color="textSubtle" fontSize="12px" bold>
            {chainNameConverter(
              chains.find((item) => item.id === outputAmount.currency.chainId)?.name ||
                getChainName(outputAmount.currency.chainId),
            )}
          </Text>
        </AutoColumn>
      </Row>

      {showAcceptChanges ? (
        <SwapShowAcceptChanges justify="flex-start" gap="0px">
          <RowBetween>
            <RowFixed>
              <ErrorIcon mr="8px" />
              <Text bold> {t('Price Updated')}</Text>
            </RowFixed>
            <Button onClick={onAcceptChanges}>{t('Accept')}</Button>
          </RowBetween>
        </SwapShowAcceptChanges>
      ) : null}
      {tradeType === TradeType.EXACT_OUTPUT && !isEnoughInputBalance && (
        <AutoColumn justify="flex-start" gap="sm" style={{ padding: '24px 0 0 0px' }}>
          <Text fontSize={12} color="failure" textAlign="left" style={{ width: '100%' }}>
            {t('Insufficient input token balance. Your transaction may fail.')}
          </Text>
        </AutoColumn>
      )}
      {recipient ? (
        <AutoColumn justify="flex-start" gap="sm" style={{ padding: '12px 0 0 0px' }}>
          <Text fontSize={12} color="textSubtle">
            {recipientSentToText}
            <b title={recipient}>{truncatedRecipient}</b>
            {postSentToText}
          </Text>
        </AutoColumn>
      ) : null}
    </AutoColumn>
  )
}
