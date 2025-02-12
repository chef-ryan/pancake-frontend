import invariant from 'tiny-invariant'
import { AgnosticBaseCurrency } from './AgnosticBaseCurrency'
import { Token } from './Token'
import { NATIVE, WNATIVE } from '../nativeTokens'
import { TonChainId, TonNetworks } from '../ton.enums'

/**
 * Represents the native currency of the chain on which it resides
 */

interface NativeArgs {
  chainId: TonChainId
  decimals: number
  symbol: string
  name: string
  logoURI?: string
}

export class Native extends AgnosticBaseCurrency {
  public readonly isNative = true as const

  public readonly isToken = false as const

  public readonly logoURI?: string

  public override readonly chainId: TonChainId

  constructor({ chainId, decimals, symbol, name, logoURI }: NativeArgs) {
    super(chainId, decimals, symbol, name)
    this.chainId = chainId
    this.logoURI = logoURI
  }

  get wrapped(): Token {
    return WNATIVE[this.chainId]
  }

  private static cache: { [chainId: number]: Native } = {}

  public static onChain(chainId: TonChainId): Native {
    if (chainId in this.cache) {
      return this.cache[chainId]
    }
    if (!NATIVE[chainId]) {
      throw new Error('NATIVE_CURRENCY_NOT_FOUND')
    }

    const native = new Native(NATIVE[chainId])
    this.cache[chainId] = native
    return native
  }

  public static onNetwork(network: TonNetworks): Native {
    return this.onChain(network === TonNetworks.Mainnet ? TonChainId.Mainnet : TonChainId.Testnet)
  }

  public equals(other?: AgnosticBaseCurrency): boolean {
    return !!other && other.isNative && other.chainId === this.chainId
  }

  /**
   * Returns true if the address of this token sorts before the address of the other token
   * @param other other token to compare
   * @throws if the tokens have the same address
   * @throws if the tokens are on different chains
   */
  public sortsBefore(other: AgnosticBaseCurrency): boolean {
    invariant(this.chainId === other.chainId, 'CHAIN_IDS')
    return true
  }
}
