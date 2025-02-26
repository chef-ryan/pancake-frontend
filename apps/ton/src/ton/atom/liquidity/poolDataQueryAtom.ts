import { Contracts, TonContractNames, type TonNetworks } from '@pancakeswap/ton-v2-sdk'
import { atomWithQuery } from 'jotai-tanstack-query'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { parseAddress } from 'ton/utils/address'

import { poolContractAtom } from '../contracts/poolContractAtom'
import { networkAtom } from '../networkAtom'
import { poolAddressAtom } from './poolAddressAtom'
import { getJettonWalletAddress } from '../jettonWalletAddressAtom'
import { chainIdAtom } from '../chainIdAtom'

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

        const chainId = get(chainIdAtom)
        const routerAddress = parseAddress(Contracts[TonContractNames.PCSRouter][chainId].address)
        const jettonWallet0 = await getJettonWalletAddress(token0Address, routerAddress)
        const jettonWallet1 = await getJettonWalletAddress(token1Address, routerAddress)
        const [jetton0MasterAddress, jetton1MasterAddress] =
          jettonWallet0 && jettonWallet0.equals(result.token0Address)
            ? [token0Address, token1Address]
            : jettonWallet1 && jettonWallet1.equals(result.token0Address)
            ? [token1Address, token0Address]
            : [token0Address, token1Address]
        return {
          ...result,
          poolAddress,
          jetton0MasterAddress,
          jetton1MasterAddress,
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
