import { AgnosticNativeCurrency } from './AgnosticNativeCurrency'
import { Jetton } from './Jetton'

export type Currency = AgnosticNativeCurrency | Jetton
export class Token extends Jetton {}
