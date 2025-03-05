import { ModalV2, useModalV2 } from '@pancakeswap/uikit'
import { Swap as SwapUI } from '@pancakeswap/widgets-internal'

import { useTranslation } from '@pancakeswap/localization'
import { Price, Currency } from '@pancakeswap/sdk'
import { useUserSlippage } from '@pancakeswap/utils/user'
import { memo } from 'react'

import { SettingsModalV2 } from 'components/Menu/GlobalSettings/SettingsModalV2'
import { useIsWrapping } from '../hooks'

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
  const { t } = useTranslation()
  const [allowedSlippage] = useUserSlippage()
  const isWrapping = useIsWrapping()
  const { isOpen, onOpen, onDismiss } = useModalV2()

  if (isWrapping) {
    return null
  }

  const priceNode = price ? (
    <>
      <SwapUI.InfoLabel>{t('Price')}</SwapUI.InfoLabel>
      <SwapUI.TradePrice price={price} loading={priceLoading} />
    </>
  ) : null

  return (
    <SwapUI.Info
      price={priceNode}
      allowedSlippage={showSlippage ? allowedSlippage : undefined}
      onSlippageClick={onOpen}
    >
      <ModalV2 isOpen={isOpen} onDismiss={onDismiss} closeOnOverlayClick>
        <SettingsModalV2 onDismiss={onDismiss} />
      </ModalV2>
    </SwapUI.Info>
  )
})
