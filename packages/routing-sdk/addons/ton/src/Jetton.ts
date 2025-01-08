import { AgnosticToken } from './AgnosticToken'

export class Jetton extends AgnosticToken {
  public sortsBefore(other: Jetton): boolean {
    return super.sortsBefore(other)
  }

  public equals(other: Jetton): boolean {
    return this.chainId === other.chainId && this.address === other.address
  }
}
