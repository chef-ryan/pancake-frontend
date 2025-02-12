import { atomWithQuery } from 'jotai-tanstack-query'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { networkAtom } from 'ton/atom/networkAtom'
import { fetchTokenByAddress } from 'utils/tokens/currency'

export const tokenByAddressAtom = atomFamily((address: string) => {
  return atomWithQuery((get) => ({
    queryKey: ['tokenByAddress', get(networkAtom), address],
    queryFn: () => fetchTokenByAddress(address, get(networkAtom)),
    enabled: !!address,
    staleTime: Infinity,
  }))
}, isEqual)
