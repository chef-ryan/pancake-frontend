import { AgnosticNativeCurrency } from './AgnosticNativeCurrency'
import { Jetton } from './Jetton'

export class Token extends Jetton {}
export type Currency = AgnosticNativeCurrency | Token
