import { ModalV2, useModalV2 } from '@pancakeswap/uikit'
import { SwapUIV2 } from '@pancakeswap/widgets-internal'

import { Currency, Price } from '@pancakeswap/sdk'
import { useUserSlippage } from '@pancakeswap/utils/user'
import { memo } from 'react'

import { SettingsModalV2 } from 'components/Menu/GlobalSettings/SettingsModalV2'
import { useIsWrapping } from '../../Swap/V3Swap/hooks'

interface Props {
  showSlippage?: boolean
  priceLoading?: boolean
  price?: Price<Currency, Currency>
}

export const PricingAndSlippage = memo(function PricingAndSlippage({
  priceLoading,
  price,
  showSlippage = true,
}: Props) {
  const [allowedSlippage] = useUserSlippage()
  const isWrapping = useIsWrapping()
  const { isOpen, onOpen, onDismiss } = useModalV2()

  if (isWrapping || !price) {
    return null
  }

  const priceNode = price ? (
    <>
      <SwapUIV2.TradePrice price={price} loading={priceLoading} />
    </>
  ) : null

  return (
    <SwapUIV2.SwapInfo
      price={priceNode}
      allowedSlippage={showSlippage ? allowedSlippage : undefined}
      onSlippageClick={onOpen}
    >
      <ModalV2 isOpen={isOpen} onDismiss={onDismiss} closeOnOverlayClick>
        <SettingsModalV2 onDismiss={onDismiss} />
      </ModalV2>
    </SwapUIV2.SwapInfo>
  )
})
