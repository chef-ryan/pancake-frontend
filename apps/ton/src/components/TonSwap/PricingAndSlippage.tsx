import { Currency, CurrencyAmount, Price } from '@pancakeswap/ton-v2-sdk'
import { FlexGap, Text, useModal } from '@pancakeswap/uikit'
import { useUserSlippage } from '@pancakeswap/utils/user'
import { RefreshButton, SwapUIV2 } from '@pancakeswap/widgets-internal'
import { SettingsModal } from 'components/Modals/SettingsModal'
import { memo } from 'react'

interface Props {
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

  if (!price) {
    return null
  }

  const priceNode = price ? <SwapUIV2.TradePrice price={price as any} loading={isLoading} /> : null

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
        <RefreshButton refreshDuration={12_000} onRefresh={onRefresh} refreshDisabled={isLoading} loading={isLoading} />
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
