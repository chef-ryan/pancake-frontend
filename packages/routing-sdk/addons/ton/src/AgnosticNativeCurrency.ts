import { AgnosticBaseCurrency } from './AgnosticBaseCurrency'
import { AgnosticToken } from './AgnosticToken'

/**
 * Represents the native currency of the chain on which it resides
 */
export abstract class AgnosticNativeCurrency extends AgnosticBaseCurrency {
  public readonly isNative = true as const

  public readonly isToken = false as const

  public readonly logoURI?: string

  public get wrapped(): AgnosticToken {
    return new AgnosticToken(this.chainId, '', this.decimals, this.symbol, this.name, this.logoURI)
  }
}
