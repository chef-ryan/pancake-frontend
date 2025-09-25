import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { atomWithLoadable } from 'quoter/atom/atomWithLoadable'
import { FarmV4SupportedChainId, Protocol } from '@pancakeswap/farms'
import edgeFarmQueries, { FarmQuery } from 'state/farmsV4/search/edgeFarmQueries'

import { FarmInfo } from 'state/farmsV4/search/farm.util'

async function fetchFarmList({
  extend = false,
  protocols,
  tokens,
  symbols,
  chains,
  sortBy,
}: {
  extend?: boolean
  protocols?: Protocol[]
  tokens?: string[]
  symbols?: string[]
  chains?: FarmV4SupportedChainId[]
  sortBy?: FarmQuery['sortBy']
}) {
  const pools = await edgeFarmQueries.queryFarms({
    extend,
    protocols: protocols || [],
    tokens,
    symbols,
    chains: chains || [],
    sortBy,
  })
  return pools
}

export const baseFarmListAtom = atomFamily(
  (params: { chains: FarmV4SupportedChainId[]; protocols: Protocol[]; sortBy?: FarmQuery['sortBy'] }) => {
    return atomWithLoadable<FarmInfo[]>(async () => {
      const { chains, protocols, sortBy } = params
      return fetchFarmList({
        extend: false,
        chains,
        protocols,
        sortBy,
      })
    })
  },
  isEqual,
)

export const extendFarmListAtom = atomFamily(
  (params: {
    protocols: Protocol[]
    chains: FarmV4SupportedChainId[]
    tokens?: string[]
    symbols?: string[]
    sortBy?: FarmQuery['sortBy']
  }) => {
    const { protocols, tokens, symbols, chains, sortBy } = params
    return atomWithLoadable<FarmInfo[]>(async () => {
      return fetchFarmList({
        extend: true,
        protocols,
        tokens,
        symbols,
        chains,
        sortBy,
      })
    })
  },
  isEqual,
)
