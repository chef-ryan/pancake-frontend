import { useMemo } from 'react'
import flatMap from 'lodash/flatMap'
import uniqBy from 'lodash/uniqBy'
import { Currency, Token, Pair, CurrencyAmount } from '@pancakeswap/ton-v2-sdk'
import { ADDITIONAL_BASES, BASES_TO_CHECK_TRADES_AGAINST, CUSTOM_BASES } from 'config/constants/exchange'
import { useAtomValue } from 'jotai'
import { poolDataQueriesAtom } from 'ton/atom/liquidity/poolDataQueriesAtom'

export function useAllCommonPairs(currencyA?: Currency, currencyB?: Currency): { isLoading: boolean; data: Pair[] } {
  const chainId = currencyA?.chainId

  const [tokenA, tokenB] = chainId ? [currencyA?.wrapped, currencyB?.wrapped] : [undefined, undefined]

  const bases: Token[] = useMemo(() => {
    if (!chainId) return []

    const common = BASES_TO_CHECK_TRADES_AGAINST[chainId] ?? []
    const additionalA = tokenA ? ADDITIONAL_BASES[chainId]?.[tokenA.address] ?? [] : []
    const additionalB = tokenB ? ADDITIONAL_BASES[chainId]?.[tokenB.address] ?? [] : []

    return [...common, ...additionalA, ...additionalB]
  }, [chainId, tokenA, tokenB])

  const basePairs: [Token, Token][] = useMemo(
    () => flatMap(bases, (base): [Token, Token][] => bases.map((otherBase) => [base, otherBase])),
    [bases],
  )

  const allPairCombinations: [Token, Token][] = useMemo(
    () =>
      tokenA && tokenB
        ? [
            // the direct pair
            [tokenA, tokenB],
            // token A against all bases
            ...bases.map((base): [Token, Token] => [tokenA, base]),
            // token B against all bases
            ...bases.map((base): [Token, Token] => [tokenB, base]),
            // each base against all bases
            ...basePairs,
          ]
            .filter((tokens): tokens is [Token, Token] => Boolean(tokens[0] && tokens[1]))
            .filter(([t0, t1]) => !t0.equals(t1))
            .filter(([tokenA_, tokenB_]) => {
              if (!chainId) return true
              const customBases = CUSTOM_BASES[chainId]

              const customBasesA: Token[] | undefined = customBases?.[tokenA_.address]
              const customBasesB: Token[] | undefined = customBases?.[tokenB_.address]

              if (!customBasesA && !customBasesB) return true

              if (customBasesA && !customBasesA.find((base) => tokenB_.equals(base))) return false
              if (customBasesB && !customBasesB.find((base) => tokenA_.equals(base))) return false

              return true
            })
        : [],
    [tokenA, tokenB, bases, basePairs, chainId],
  )

  const { data: allPairs, isLoading } = usePairs(allPairCombinations)

  // only pass along valid pairs, non-duplicated pairs
  return useMemo(
    () =>
      isLoading
        ? {
            isLoading,
            data: [],
          }
        : {
            isLoading,
            data: allPairs
              ? uniqBy(
                  allPairs.filter((result): result is NonNullable<typeof result> => Boolean(result)),
                  (p) => p.poolAddress,
                )
              : [],
          },
    [allPairs, isLoading],
  )
}

const usePairs = (pairs: [Token, Token][]) => {
  const pairsAddress = useMemo(
    () =>
      pairs.map(([token0, token1]) =>
        token0.sortsBefore(token1)
          ? {
              token0Address: token0.wrapped.address,
              token1Address: token1.wrapped.address,
            }
          : {
              token0Address: token1.wrapped.address,
              token1Address: token0.wrapped.address,
            },
      ),
    [pairs],
  )
  const result = useAtomValue(poolDataQueriesAtom(pairsAddress))
  return useMemo(() => {
    if (result.isLoading) {
      return {
        isLoading: result.isLoading,
        data: result.data,
      }
    }
    const data = pairs.map(([token0_, token1_], idx) => {
      const pool = result.data?.[idx]
      if (!pool) {
        return null
      }
      const [token0, token1] = token0_.sortsBefore(token1_) ? [token0_, token1_] : [token1_, token0_]
      return {
        ...pool,
        chainId: token0.chainId,
        token0,
        token1,
        reserve0: CurrencyAmount.fromRawAmount(token0, pool.reserve0),
        reserve1: CurrencyAmount.fromRawAmount(token1, pool.reserve1),
      }
    })
    return {
      isLoading: false,
      data,
    }
  }, [pairs, result.data, result.isLoading])
}
