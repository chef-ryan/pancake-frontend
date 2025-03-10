import { QUERY_MEDIUM_STALE_TIME, QUERY_RETRY_DELAY } from 'config/constants/exchange'
import { txReceiptAtom } from 'hooks/useLatestTxReceipt'
import { atomWithQuery } from 'jotai-tanstack-query'
import { atomFamily } from 'jotai/utils'
import isEqual from 'lodash/isEqual'
import { getLpAccountAddress } from 'ton/utils/api'
import { addressAtom } from '../addressAtom'
import { chainIdAtom } from '../chainIdAtom'
import { lpAccountContractAtom } from '../contracts/lpAccountContractAtom'
import { networkAtom } from '../networkAtom'

export const lpAccountMultipleQueryAtom = atomFamily((poolAddresses: string[]) => {
  return atomWithQuery((get) => ({
    queryKey: ['lpAccountMultiple', get(networkAtom), poolAddresses, get(txReceiptAtom)],
    queryFn: async () => {
      async function getLpAccountData(poolAddress: string) {
        const userAddress = get(addressAtom)
        if (!poolAddress)
          return {
            amount0: 0n,
            amount1: 0n,
            poolAddress,
            userAddress,
            lpAccountAddress: '',
          }

        const lpAccountAddress = await getLpAccountAddress(get(chainIdAtom), userAddress, poolAddress)

        const lpAccount = get(lpAccountContractAtom(lpAccountAddress.toString()))
        const data = await lpAccount.getGetLpAccountData()

        return {
          lpAccountAddress: lpAccountAddress.toString(),
          amount0: data.amount0 ?? 0n,
          amount1: data.amount1 ?? 0n,
          poolAddress: data.poolAddress.toString(),
          userAddress: data.userAddress.toString(),
        }
      }
      return (await Promise.allSettled(poolAddresses.map(getLpAccountData))).map((result, index) =>
        result.status === 'fulfilled'
          ? result.value
          : {
              amount0: 0n,
              amount1: 0n,
              poolAddress: poolAddresses[index],
              userAddress: get(addressAtom),
              lpAccountAddress: '',
            },
      )
    },
    enabled: !!poolAddresses.length && !!get(addressAtom),
    refetchInterval: QUERY_MEDIUM_STALE_TIME,
    retry: 1,
    retryDelay: QUERY_RETRY_DELAY,
    initialData: [],
  }))
}, isEqual)
