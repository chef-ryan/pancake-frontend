type ExtensionValue = string | number | boolean | null | undefined

export interface TokenInfo {
  readonly chainId: number
  readonly name: string
  readonly symbol: string
  readonly address: string
  readonly decimals: number
  readonly logoURI?: string
  readonly tags?: string[]
  readonly extensions?: {
    readonly [key: string]:
      | {
          [key: string]:
            | {
                [key: string]: ExtensionValue
              }
            | ExtensionValue
        }
      | ExtensionValue
  }
}

export interface Version {
  readonly major: number
  readonly minor: number
  readonly patch: number
}

export interface Tags {
  readonly [tagId: string]: {
    readonly name: string
    readonly description: string
  }
}

export interface TokenList {
  readonly name: string
  readonly timestamp: string
  readonly version: Version
  readonly tokens: TokenInfo[]
  readonly keywords?: string[]
  readonly tags?: Tags
  readonly logoURI?: string
}
