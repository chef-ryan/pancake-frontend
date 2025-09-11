import { ChainId } from '@pancakeswap/chains'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import qs from 'qs'
import { atomWithLoadable } from 'quoter/atom/atomWithLoadable'
import { FarmV4SupportedChainId, Protocol } from '@pancakeswap/farms'
import edgeFarmQueries from 'state/farmsV4/search/edgeFarmQueries'

import { SerializedFarmInfo } from 'state/farmsV4/search/farm.util'

async function fetchFarmList({
  extend = false,
  protocols,
  tokens,
  chains,
}: {
  extend?: boolean
  protocols?: Protocol[]
  tokens?: string[]
  chains?: FarmV4SupportedChainId[]
}) {
  const pools = await edgeFarmQueries.queryFarms({
    extend,
    protocols: protocols || [],
    tokens,
    chains: chains || [],
  })
  // const queryStr = qs.stringify({
  //   extend: extend ? 1 : undefined,
  //   protocols: protocols ? protocols.join(',') : undefined,
  //   address,
  //   chains: chains?.join(','),
  // })
  // const api = `${process.env.NEXT_PUBLIC_EDGE_ENDPOINT || ''}/api/farm/list?${queryStr}`
  // const response = await fetch(api, {
  //   method: 'GET',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  // })
  // if (!response.ok) {
  //   throw new Error(`Failed to fetch farms: ${response.statusText}`)
  // }
  // const resp = (await response.json()) as {
  //   data: SerializedFarmInfo[]
  //   lastUpdated: number
  // }
  return pools
}

export const baseFarmListAtom = atomFamily((params: { chains: FarmV4SupportedChainId[]; protocols: Protocol[] }) => {
  return atomWithLoadable<SerializedFarmInfo[]>(async () => {
    const { chains, protocols } = params
    return fetchFarmList({
      extend: false,
      chains,
      protocols,
    })
  })
}, isEqual)

export const extendFarmListAtom = atomFamily(
  (params: { protocols: Protocol[]; chains: FarmV4SupportedChainId[]; tokens?: string[] }) => {
    const { protocols, tokens, chains } = params
    return atomWithLoadable<SerializedFarmInfo[]>(async () => {
      return fetchFarmList({
        extend: true,
        protocols,
        tokens,
        chains,
      })
    })
  },
  isEqual,
)
