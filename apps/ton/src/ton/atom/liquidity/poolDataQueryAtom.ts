import { type TonNetworks } from '@pancakeswap/ton-v2-sdk'
import { atomWithQuery } from 'jotai-tanstack-query'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { poolContractAtom } from '../contracts/poolContractAtom'
import { networkAtom } from '../networkAtom'
import { poolAddressAtom } from './poolAddressAtom'

export const getKeyByPair = ({
  token0Address,
  token1Address,
  network,
}: PoolDataAtomParams & { network: TonNetworks }) => {
  return ['poolData', network, token0Address, token1Address]
}

interface PoolDataAtomParams {
  token0Address?: string
  token1Address?: string
}
export const poolDataQueryAtom = atomFamily(({ token0Address, token1Address }: PoolDataAtomParams) => {
  return atomWithQuery((get) => ({
    queryKey: getKeyByPair({ token0Address, token1Address, network: get(networkAtom) }),
    queryFn: async () => {
      try {
        const poolAddress = await get(poolAddressAtom({ token0Address, token1Address }))
        if (!poolAddress) {
          return null
        }

        const pool = get(poolContractAtom(poolAddress))
        const result = await pool.getGetPoolData()
        return {
          ...result,
          poolAddress,
        }
      } catch (e) {
        // if AxiosError, trigger retry
        // otherwise, treat as no pool exist
        if ((e as any)?.isAxiosError) {
          throw new Error((e as any).message)
        }
        return null
      }
    },
    enabled: Boolean(token0Address && token1Address),
    retry: 5,
    refetchOnWindowFocus: false,
  }))
}, isEqual)
