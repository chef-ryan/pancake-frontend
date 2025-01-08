import { NativeCurrency } from '@pancakeswap/swap-sdk-core'
import { Jetton } from './Jetton'

export type Currency = NativeCurrency | Jetton
export class Token extends Jetton {}
