export interface BridgeRoute {
  originChainId: number
  originToken: string
  destinationChainId: number
  destinationToken: string
  originTokenSymbol: string
  destinationTokenSymbol: string
  isNative: boolean
}
