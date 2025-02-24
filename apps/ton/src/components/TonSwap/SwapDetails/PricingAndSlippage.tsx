import { Currency, CurrencyAmount, Price } from '@pancakeswap/ton-v2-sdk'
import { FlexGap, Text, useModal } from '@pancakeswap/uikit'
import { SwapUIV2 } from '@pancakeswap/widgets-internal'
import { SettingsModal } from 'components/Modals/SettingsModal'
import { useUserSlippage } from 'hooks/useUserSlippage'
import { memo, useMemo } from 'react'

interface Props {
  inputCurrency?: Currency
  outputCurrency?: Currency
  showSlippage: boolean
  showFee: boolean
  isLoading: boolean
  price?: Price<Currency, Currency> | null
  fee?: CurrencyAmount<Currency> | null
  onRefresh: () => void
}

export const PricingAndSlippage = memo(({ isLoading, price, showSlippage, showFee, fee, onRefresh }: Props) => {
  const [allowedSlippage] = useUserSlippage()
  const [onPresentSettingsModal] = useModal(<SettingsModal isOpen={false} />)

  const priceNode = useMemo(
    () =>
      isLoading || price ? (
        <SwapUIV2.TradePrice price={price as any} loading={isLoading} show iconColor="primary60" />
      ) : (
        '-'
      ),
    [price, isLoading],
  )

  return (
    <FlexGap alignItems="center" flexWrap="wrap" justifyContent="space-between" width="calc(100% - 20px)" gap="8px">
      <FlexGap
        marginLeft="-8px"
        onClick={(e) => {
          e.stopPropagation()
        }}
        alignItems="center"
        flexWrap="wrap"
      >
        <SwapUIV2.RefreshButton
          refreshDuration={12_000}
          onRefresh={onRefresh}
          refreshDisabled={isLoading}
          loading={isLoading}
        />
        <SwapUIV2.SwapInfo
          price={priceNode}
          allowedSlippage={showSlippage ? allowedSlippage : undefined}
          onSlippageClick={onPresentSettingsModal}
        />
      </FlexGap>
      {showFee ? (
        <Text fontSize="14px" color="textSubtle">
          Fee {fee ? `${fee.toSignificant(4)} ${fee.currency.symbol}` : '-'}
        </Text>
      ) : null}
    </FlexGap>
  )
})
