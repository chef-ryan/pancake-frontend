import type { NativeCurrency } from './nativeCurrency'
import type { Token } from './token'

export type Currency = NativeCurrency | Token

export type SPL = Currency & {
  address: string
  programId: string
}

export const isSPL = (currency: Currency): currency is SPL => {
  return 'programId' in currency && typeof (currency as any).programId === 'string'
}
