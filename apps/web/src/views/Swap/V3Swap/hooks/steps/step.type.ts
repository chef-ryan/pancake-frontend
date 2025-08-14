import { PriceOrder } from '@pancakeswap/price-api-sdk'
import { CurrencyAmount, Token } from '@pancakeswap/swap-sdk-core'
import { ConfirmModalState } from '@pancakeswap/widgets-internal'
import { Dispatch, SetStateAction } from 'react'
import { Address } from 'viem/accounts'

export interface ConfirmStepContext {
  order: PriceOrder | undefined
  amountToApprove: CurrencyAmount<Token> | undefined
  spender: Address | undefined
  resetState: () => void
  showError: (message: string) => void
  setConfirmState: Dispatch<SetStateAction<ConfirmModalState>>
}
