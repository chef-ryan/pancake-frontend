import { Address } from '@ton/core'
import { AgnosticToken } from './AgnosticToken'

export class Token extends AgnosticToken {
  public constructor(
    chainId: number,
    address: string,
    decimals: number,
    symbol: string,
    name?: string,
    logoURI?: string,
    projectLink?: string,
  ) {
    super(chainId, Address.parse(address).toString(), decimals, symbol, name, logoURI, projectLink)
  }
}
