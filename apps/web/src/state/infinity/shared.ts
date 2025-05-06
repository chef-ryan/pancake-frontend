import { parseAsBoolean, parseAsInteger, parseAsStringLiteral, useQueryState, useQueryStates } from 'nuqs'
import { useCallback } from 'react'

export const useInverted = () => {
  return useQueryState(
    'inverted',
    parseAsBoolean.withOptions({
      shallow: true,
    }),
  )
}

export const useBinRangeQueryState = () => {
  return useQueryStates({
    lowerBinId: parseAsInteger.withOptions({ shallow: true }),
    upperBinId: parseAsInteger.withOptions({ shallow: true }),
  })
}

export const useClRangeQueryState = () => {
  return useQueryStates({
    lowerTick: parseAsInteger.withOptions({ shallow: true }),
    upperTick: parseAsInteger.withOptions({ shallow: true }),
  })
}
export const useBinNumQueryState = () =>
  useQueryState(
    'numBin',
    parseAsInteger.withOptions({
      shallow: true,
    }),
  )

export const useLiquidityShapeQueryState = () => {
  return useQueryState(
    'liquidityShape',
    parseAsStringLiteral(['Spot', 'Curve', 'BidAsk'] as const)
      .withDefault('Spot')
      .withOptions({ shallow: true }),
  )
}

export const useClearAllQueryStates = () => {
  const [, setInverted] = useInverted()
  const [, setNumBin] = useBinNumQueryState()
  const [, setLiquidityShape] = useLiquidityShapeQueryState()
  const [, setBinRange] = useBinRangeQueryState()
  const [, setClRange] = useClRangeQueryState()

  return useCallback(() => {
    setInverted(null)
    setNumBin(null)
    setLiquidityShape(null)
    setBinRange({ lowerBinId: null, upperBinId: null })
    setClRange({ lowerTick: null, upperTick: null })
  }, [setInverted, setNumBin, setLiquidityShape, setBinRange, setClRange])
}
