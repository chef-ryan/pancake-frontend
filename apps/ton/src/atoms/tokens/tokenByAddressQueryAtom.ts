import { atomWithQuery } from 'jotai-tanstack-query'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { chainIdAtom } from 'ton/atom/chainIdAtom'
import { fetchTokenByAddress } from 'utils/tokens/currency'

export const tokenByAddressQueryAtom = atomFamily((address: string) => {
  return atomWithQuery((get) => ({
    queryKey: ['tokenByAddress', get(chainIdAtom), address],
    queryFn: () => fetchTokenByAddress(address, get(chainIdAtom)),
    enabled: !!address,
    staleTime: Infinity,
  }))
}, isEqual)
