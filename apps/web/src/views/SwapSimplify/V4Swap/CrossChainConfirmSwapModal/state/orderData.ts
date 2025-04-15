import { PriceOrder } from '@pancakeswap/price-api-sdk'
import { Currency } from '@pancakeswap/sdk'
import { atom } from 'jotai'
import { CrossChainOrderStatus, CrossChainOrderStepStatus, CrossChainOrderStepType } from '../types'

export const crossChainOrderDataAtom = atom<{
  // status can be derived from steps status
  status: CrossChainOrderStatus | null
  resultInformation?: {
    amount: string
    currency: Currency
    chainName: string
  }

  order: PriceOrder | null | undefined
  originalOrder: PriceOrder | null | undefined
  // TODO: Add txHash, orderId, etc. as needed
  steps?: {
    type: CrossChainOrderStepType
    status?: CrossChainOrderStepStatus
    inputCurrency?: Currency
    outputCurrency?: Currency
    inputAmount?: string
    outputAmount?: string
    inputChainName?: string
    outputChainName?: string
    tx?: {
      hash: string
      chainId: number
    }
    failureMessage?: string
  }[]
}>({
  status: null,
  order: null,
  originalOrder: null,
  steps: [],
})

export const crossChainOrderStatus = atom((get) => get(crossChainOrderDataAtom).status)
