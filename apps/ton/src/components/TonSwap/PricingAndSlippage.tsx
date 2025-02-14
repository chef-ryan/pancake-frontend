import { Currency, Price } from '@pancakeswap/ton-v2-sdk'
import { useModal } from '@pancakeswap/uikit'
import { useUserSlippage } from '@pancakeswap/utils/user'
import { SwapUIV2 } from '@pancakeswap/widgets-internal'
import { SettingsModal } from 'components/Modals/SettingsModal'

interface Props {
  showSlippage?: boolean
  priceLoading?: boolean
  price?: Price<Currency, Currency>
}

export const PricingAndSlippage = ({ priceLoading, price, showSlippage = true }: Props) => {
  const [allowedSlippage] = useUserSlippage()
  const [onPresentSettingsModal] = useModal(<SettingsModal isOpen={false} />)

  if (!price) {
    return null
  }

  const priceNode = price ? <SwapUIV2.TradePrice price={price as any} loading={priceLoading} /> : null

  return (
    <SwapUIV2.SwapInfo
      price={priceNode}
      allowedSlippage={showSlippage ? allowedSlippage : undefined}
      onSlippageClick={onPresentSettingsModal}
    />
  )
}
