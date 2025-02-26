import { Address } from '@ton/core'
import { AgnosticToken } from './AgnosticToken'

export class Token extends AgnosticToken {
  /**
   * Jetton Data's walletCode useful for computing jetton wallet address
   */
  public jettonCode?: string

  public constructor(
    chainId: number,
    address: string,
    decimals: number,
    symbol: string,
    name?: string,
    logoURI?: string,
    jettonCode?: string,
    projectLink?: string,
  ) {
    super(chainId, Address.parse(address).toString(), decimals, symbol, name, logoURI, projectLink)
    this.jettonCode = jettonCode
  }

  public get wrapped(): Token {
    return this
  }
}
