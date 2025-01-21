import { AgnosticToken } from './AgnosticToken'

export class Jetton extends AgnosticToken {
  public sortsBefore(other: Jetton): boolean {
    return super.sortsBefore(other)
  }
}
