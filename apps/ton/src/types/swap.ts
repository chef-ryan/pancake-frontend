export enum Field {
  INPUT = 'INPUT',
  OUTPUT = 'OUTPUT',
}

export type PairDataNormalized = {
  time: number
  token0Id: string
  token1Id: string
  reserve0: number
  reserve1: number
}[]

export type DerivedPairDataNormalized = {
  time: number
  token0Id: string
  token1Id: string
  token0DerivedUSD: number
  token1DerivedUSD: number
}[]

export interface SwapState {
  readonly independentField: Field
  readonly typedValue: string
  readonly [Field.INPUT]: {
    readonly currencyId: string | undefined
  }
  readonly [Field.OUTPUT]: {
    readonly currencyId: string | undefined
  }

  // TODO: Remove below fields if not required

  // the typed recipient address or ENS name, or null if swap should go to sender
  readonly recipient: string | null
  readonly pairDataById: Record<number, Record<string, PairDataNormalized>> | null
  readonly derivedPairDataById: Record<number, Record<string, DerivedPairDataNormalized>> | null
}
