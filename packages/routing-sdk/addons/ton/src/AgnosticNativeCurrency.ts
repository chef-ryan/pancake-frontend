import { AgnosticBaseCurrency } from './AgnosticBaseCurrency'

/**
 * Represents the native currency of the chain on which it resides, e.g.
 */
export abstract class AgnosticNativeCurrency extends AgnosticBaseCurrency {
  public readonly isNative = true as const

  public readonly isToken = false as const

  public readonly logoURI?: string
}
