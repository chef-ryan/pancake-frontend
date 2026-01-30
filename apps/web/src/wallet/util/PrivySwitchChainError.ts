export class PrivySwitchChainError extends Error {
  constructor(public chainId?: number, message?: string) {
    super(message || `Privy switch chain error: ${chainId}`)
    this.name = 'PrivySwitchChainError'
  }
}
