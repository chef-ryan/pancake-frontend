import invariant from 'tiny-invariant'
import { BaseCurrency } from './baseCurrency'
import { Currency } from './currency'
import { Token } from './token'

export interface SerializedSPLToken {
  chainId: number
  address: string
  programId: string
  decimals: number
  symbol: string
  name?: string
  projectLink?: string
}

/**
 * Represents an SPL token on Solana or other non-EVM chains.
 */
export class SPLToken extends BaseCurrency {
  public readonly isNative: false = false as const

  public readonly isToken: true = true as const

  public readonly address: string

  public readonly programId: string

  public readonly projectLink?: string

  public constructor(
    chainId: number,
    programId: string,
    decimals: number,
    symbol: string,
    name?: string,
    projectLink?: string
  ) {
    super(chainId, decimals, symbol, name)
    this.address = programId
    this.programId = programId
    this.projectLink = projectLink
  }

  /**
   * Returns true if the two tokens are equivalent, i.e. have the same chainId and programId.
   * @param other other token to compare
   */
  public equals(other: Currency): boolean {
    return 'programId' in other && this.chainId === other.chainId && this.programId === (other as SPLToken).programId
  }

  public sortsBefore(other: SPLToken): boolean {
    invariant(this.chainId === other.chainId, 'CHAIN_IDS')
    invariant(this.programId !== other.programId, 'ADDRESSES')
    return this.programId.toLowerCase() < other.programId.toLowerCase()
  }

  /* For compatibility */
  public get wrapped(): Token {
    return this as any as Token
  }

  public get serialize(): SerializedSPLToken {
    return {
      address: this.address,
      programId: this.programId,
      chainId: this.chainId,
      decimals: this.decimals,
      symbol: this.symbol,
      name: this.name,
      projectLink: this.projectLink,
    }
  }
}
